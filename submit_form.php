<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    $message = htmlspecialchars($_POST['message']);

    // Here, you would normally send the email or save to a database
    echo "Takk for meldingen, $name! Vi vil ta kontakt med deg snart.";
}
?>
