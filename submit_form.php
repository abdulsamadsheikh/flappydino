<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // Load PHPMailer

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars(trim($_POST['name']));
    $email = htmlspecialchars(trim($_POST['email']));
    $message = htmlspecialchars(trim($_POST['message']));

    if (empty($name) || empty($email) || empty($message)) {
        echo "All fields are required.";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Invalid email format.";
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // SMTP settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'abdulsamadsheikh94@gmail.com'; // Your Gmail address
        $mail->Password = 'tabb keqr tlnn hodu'; // Your Gmail password or app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465;

        // Email settings
        $mail->setFrom('your-email@gmail.com', 'Contact Form');
        $mail->addAddress('your-email@example.com'); // Recipient's email address
        $mail->Subject = 'New Contact Form Submission';
        $mail->Body = "You have received a new message from $name ($email):\n\n$message";

        $mail->send();
        echo "Thank you, $name! Your message has been sent successfully.";
    } catch (Exception $e) {
        echo "Message could not be sent. Error: {$mail->ErrorInfo}";
    }
}
?>