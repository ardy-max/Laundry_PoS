<?php
session_start();
include '../includes/db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

// If using FormData/POST standard, check $_POST
if (!$input) {
    $input = $_POST;
}

// Extract inputs
$customer_name = $input['customer_name'] ?? '';
$phone = $input['phone_number'] ?? '';
$service_id = $input['service_id'] ?? '';
$weight = floatval($input['weight_quantity'] ?? 0);
$price = floatval($input['price'] ?? 0); // Price per kg/unit
$estimated = $input['estimated_completion'] ?? '';

if (empty($customer_name) || empty($phone) || empty($service_id) || empty($weight) || empty($price)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all required fields']);
    exit;
}

$conn->begin_transaction();

try {
    // 1. Handle Customer (Check if exists by phone, else insert)
    $customer_id = null;
    $checkCust = $conn->prepare("SELECT customer_id FROM customers WHERE phone = ? LIMIT 1");
    $checkCust->bind_param("s", $phone);
    $checkCust->execute();
    $custResult = $checkCust->get_result();

    if ($row = $custResult->fetch_assoc()) {
        $customer_id = $row['customer_id'];
        // Optional: Update name if changed? For now, keep existing.
    } else {
        $insertCust = $conn->prepare("INSERT INTO customers (name, phone) VALUES (?, ?)");
        $insertCust->bind_param("ss", $customer_name, $phone);
        if (!$insertCust->execute()) {
            throw new Exception("Failed to create customer: " . $insertCust->error);
        }
        $customer_id = $insertCust->insert_id;
    }

    // 2. Insert Order
    $total = $weight * $price;
    $status = 'pending';
    
    // Asumsi tabel orders: order_id, user_id, customer_id, total, status, estimated_completion, created_at
    // Jika kolom estimated_completion ada
    $insertOrder = $conn->prepare("INSERT INTO orders (user_id, customer_id, total, status, estimated_completion, created_at) VALUES (?, ?, ?, ?, ?, NOW())");
    $insertOrder->bind_param("iidss", $user_id, $customer_id, $total, $status, $estimated);
    
    if (!$insertOrder->execute()) {
         throw new Exception("Failed to create order: " . $insertOrder->error);
    }
    $order_id = $insertOrder->insert_id;

    // 3. Insert Order Items
    $subtotal = $total;
    // Asumsi tabel order_items: item_id, order_id, service_id, weight, price, subtotal
    $insertItem = $conn->prepare("INSERT INTO order_items (order_id, service_id, weight, price, subtotal) VALUES (?, ?, ?, ?, ?)");
    $insertItem->bind_param("iiddd", $order_id, $service_id, $weight, $price, $subtotal);
    
    if (!$insertItem->execute()) {
        throw new Exception("Failed to add order items: " . $insertItem->error);
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Order created successfully', 'order_id' => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
