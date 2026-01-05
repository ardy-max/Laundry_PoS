<?php
// Menghubungkan dengan database
include('../includes/db.php');

// Mendapatkan parameter order_id dari URL
$orderId = $_GET['order_id'] ?? null;

if (!$orderId) {
    echo json_encode(['success' => false, 'message' => 'Order ID tidak ditemukan.']);
    exit;
}

// Mengambil data pesanan berdasarkan order_id, bergabung dengan tabel customer, services, dan order_items
$query = "SELECT o.order_id, c.name AS customer, c.phone, s.name AS services, o.total 
          FROM orders o
          JOIN customers c ON o.customer_id = c.customer_id
          JOIN order_items oi ON o.order_id = oi.order_id
          JOIN services s ON oi.service_id = s.service_id
          WHERE o.order_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $orderId); // Mengikat parameter order_id sebagai integer
$stmt->execute();
$stmt->store_result();
$stmt->bind_result($order_id, $customer, $phone, $services, $total);

// Mengambil hasil query
if ($stmt->fetch()) {
    // Mengembalikan data dalam format JSON
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
