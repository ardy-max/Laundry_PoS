<?php
include('../includes/db.php');

header('Content-Type: application/json');

// 1. HANDLE REQUEST FOR ALL SERVICES (for dropdown)
if (isset($_GET['get_services'])) {
    $query = "SELECT service_id, name, price FROM services ORDER BY name ASC";
    $result = $conn->query($query);
    $services = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $services[] = $row;
        }
    }
    echo json_encode($services);
    exit;
}

// 2. HANDLE REQUEST FOR SINGLE ORDER DATA
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = isset($_GET['order_id']) ? (int)$_GET['order_id'] : 0;

    if ($id <= 0) {
        echo json_encode(['error' => 'Invalid Order ID']);
        exit;
    }

    $sql = "
    SELECT 
        o.order_id, o.status, o.total,
        c.name AS customer_name, c.phone,
        oi.service_id, oi.weight, oi.price, oi.subtotal
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_id = ?
    LIMIT 1
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode($row);
    } else {
        echo json_encode(['error' => 'Order not found']);
    }
    exit;
}

// 3. HANDLE ORDER UPDATE (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read input
    $input = $_POST;
    
    $order_id = $input['order_id'] ?? null;
    $status = $input['status'] ?? null; // Null if disabled/not sent
    $weight = floatval($input['weight'] ?? 0);
    $service_id = $input['service_id'] ?? null;
    $adjustment = floatval($input['adjustment'] ?? 0);
    $customer_name = $input['customer_name'] ?? '';
    $phone = $input['phone'] ?? '';

    if (!$order_id) {
        echo json_encode(['success' => false, 'message' => 'Missing Order ID']);
        exit;
    }

    $conn->begin_transaction();

    try {
        // 0. Update Customer Details (Admin Special Feature)
        // First get customer_id from this order
        $custStmt = $conn->prepare("SELECT customer_id FROM orders WHERE order_id = ?");
        $custStmt->bind_param("i", $order_id);
        $custStmt->execute();
        $custRes = $custStmt->get_result();
        
        if ($custRow = $custRes->fetch_assoc()) {
            $customer_id = $custRow['customer_id'];
            
            if (!empty($customer_name) && !empty($phone)) {
                $updateCust = $conn->prepare("UPDATE customers SET name = ?, phone = ? WHERE customer_id = ?");
                $updateCust->bind_param("ssi", $customer_name, $phone, $customer_id);
                if (!$updateCust->execute()) {
                     throw new Exception("Error updating customer: " . $updateCust->error);
                }
            }
        }

        // 1. Fetch current price
        $priceStmt = $conn->prepare("SELECT price FROM services WHERE service_id = ?");
        $priceStmt->bind_param("i", $service_id);
        $priceStmt->execute();
        $priceResult = $priceStmt->get_result();
        
        $price = 0;
        if ($priceRow = $priceResult->fetch_assoc()) {
            $price = floatval($priceRow['price']);
        } else {
            throw new Exception("Service not found");
        }
        
        // 2. Calculate Subtotal and Total
        $subtotal = $weight * $price;
        $total = $subtotal + $adjustment;

        // 3. Update Order Table (Total & Status)
        if ($status) {
            $stmt1 = $conn->prepare("UPDATE orders SET status=?, total=? WHERE order_id=?");
            $stmt1->bind_param("sdi", $status, $total, $order_id);
        } else {
            // Keep old status if not provided (key for locked pending status)
            $stmt1 = $conn->prepare("UPDATE orders SET total=? WHERE order_id=?");
            $stmt1->bind_param("di", $total, $order_id);
        }
        
        if (!$stmt1->execute()) {
             throw new Exception("Error updating order: " . $stmt1->error);
        }

        // 4. Update Order Items Table
        $stmt2 = $conn->prepare("UPDATE order_items SET service_id=?, weight=?, price=?, subtotal=? WHERE order_id=?");
        $stmt2->bind_param("iddii", $service_id, $weight, $price, $subtotal, $order_id);
         if (!$stmt2->execute()) {
             throw new Exception("Error updating items: " . $stmt2->error);
        }

        $conn->commit();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}
?>
