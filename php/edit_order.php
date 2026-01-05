<?php
include('../includes/db.php');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = (int)$_GET['order_id'];

    $sql = "
    SELECT 
        o.order_id, o.status, o.total,
        c.name AS customer_name, c.phone,
        oi.service_id, oi.weight, oi.price, oi.subtotal
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_id = ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    echo json_encode($stmt->get_result()->fetch_assoc());
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = $_POST['order_id'];
    $status = $_POST['status'];
    $weight = $_POST['weight'];
    $service_id = $_POST['service_id'];
    $total = $_POST['total'];

    $conn->begin_transaction();

    $conn->query("UPDATE orders SET status='$status', total='$total' WHERE order_id='$order_id'");
    $conn->query("UPDATE order_items SET service_id='$service_id', weight='$weight' WHERE order_id='$order_id'");

    $conn->commit();
    echo json_encode(['success' => true]);
}
