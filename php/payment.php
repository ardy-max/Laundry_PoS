<?php
// Menghubungkan dengan database
include('../includes/db.php');

header('Content-Type: application/json');

// Handle POST request for processing payment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $orderId = $input['order_id'] ?? null;
    $amount = $input['amount'] ?? 0;
    $paymentMethod = $input['payment_method'] ?? 'Cash';
    
    if (!$orderId || !$amount) {
        echo json_encode(['success' => false, 'message' => 'Data tidak lengkap.']);
        exit;
    }

    // Start transaction
    $conn->begin_transaction();

    try {
        // 1. Insert into payments table
        // Asumsi schema payments: payment_id (AI), order_id, amount, method, status, created_at (DEFAULT)
        // User info: kolom tanggal adalah create_at/created_at dengan default timestamp, jadi tidak perlu di-insert manual
        $stmt = $conn->prepare("INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, 'Paid')");
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        $stmt->bind_param("ids", $orderId, $amount, $paymentMethod);
        $stmt->execute();

        // 2. Update orders status to 'progress'
        $updateStmt = $conn->prepare("UPDATE orders SET status = 'progress' WHERE order_id = ?");
        $updateStmt->bind_param("i", $orderId);
        $updateStmt->execute();

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Pembayaran berhasil.']);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'Gagal memproses pembayaran: ' . $e->getMessage()]);
    }
    exit;
}

// Handle GET request for fetching order details
// Mendapatkan parameter order_id dari URL
$orderId = $_GET['order_id'] ?? null;

if (!$orderId) {
    echo json_encode(['success' => false, 'message' => 'Order ID tidak ditemukan.']);
    exit;
}

// Mengambil data pesanan berdasarkan order_id
// Menggunakan GROUP_CONCAT untuk menggabungkan layanan jika ada banyak item
$query = "SELECT o.order_id, c.name AS customer, c.phone, 
          GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS services, 
          o.total 
          FROM orders o
          JOIN customers c ON o.customer_id = c.customer_id
          JOIN order_items oi ON o.order_id = oi.order_id
          JOIN services s ON oi.service_id = s.service_id
          WHERE o.order_id = ?
          GROUP BY o.order_id";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $orderId);
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($order_id, $customer, $phone, $services, $total);

// Mengambil hasil query
if ($stmt->fetch()) {
    echo json_encode([
        'success' => true,
        'data' => [
            'order_id' => $order_id,
            'customer' => $customer,
            'phone' => $phone,
            'services' => $services,
            'total' => $total
        ]
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Pesanan tidak ditemukan.']);
}
?>
