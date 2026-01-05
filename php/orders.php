<?php
session_start();
// Pastikan pengguna sudah login
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

include('../includes/db.php');



$user_id = (int) $_SESSION['user_id'];

// QUERY
$sql = "
    SELECT 
    o.order_id,
    c.name AS customer,
    c.phone AS phone,
    GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS services,
    COALESCE(SUM(oi.weight), 0) AS total_weight,
    o.status,
    o.created_at,
    o.total
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON oi.order_id = o.order_id
LEFT JOIN services s ON s.service_id = oi.service_id
WHERE o.user_id = ?
GROUP BY o.order_id
ORDER BY o.created_at DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

// OUTPUT JSON MURNI
echo json_encode([
    "success" => true,
    "data" => $data
]);

?>