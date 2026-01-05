<?php
include '../includes/db.php';

// List all tables
$tablesResult = $conn->query("SHOW TABLES");
if (!$tablesResult) {
    die("Error showing tables: " . $conn->error);
}

while ($row = $tablesResult->fetch_array()) {
    $tableName = $row[0];
    echo "TABLE: $tableName\n";
    echo str_repeat("-", 30) . "\n";
    
    $descResult = $conn->query("DESCRIBE `$tableName`");
    while ($field = $descResult->fetch_assoc()) {
        echo $field['Field'] . " | " . $field['Type'] . "\n";
    }
    echo "\n";
}
?>
