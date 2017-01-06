<?php

$action = isset($_GET['action']) ? $_GET['action'] : NULL;

unset($_SESSION['user']);

try {
    $app = new Application();
    switch ($action) {
        case 'register':
            if ($register_link = $app->getRegisterLink()) {
                header('Location:' . $register_link);
            } else {
                flash(status('warning', 'Register link not found!'));
            }
            break;
        case 'login':
            if ($login_link = $app->getLoginLink()) {
                header('Location:' . $login_link);
            } else {
                flash(status('warning', 'Login link not found!'));
            }
            break;
        case 'logout':
            if ($logout_link = $app->getLogoutLink()) {
                header('Location:' . $logout_link);
            } else {
                flash(status('warning', 'Logout link not found!'));
            }
            break;
        case 'password':
            if ($reset_link = $app->getLoginLink()) {
                header('Location:' . $reset_link);
            } else {
                flash(status('warning', 'Password reset link not found!'));
            }
            break;
        default:
            if (@($app->jwt->status == "AUTHENTICATED")) {
                flash(status('info', 'Login successful'));
                main($app);
            } else if (@($app->jwt->status == "LOGOUT")) {
                flash(status('info', 'Logout successful'));
                unset($_SESSION['user']);
                header('Location: index.php');
                exit;
            } elseif ($app->jwt) {
                unset($_SESSION['user']);
                flash(status('danger', print_r($app->jwt, 1)));
                #flash(status('danger', print_r($app->jwt->err->message, 1)));
            } else {
                unset($_SESSION['user']);
            }
            break;
    }
} catch (\Stormpath\Resource\ResourceError $re) {
    flash(status('warning', 'Resource error.'));
} catch (ExpiredException $ee) {
    flash(status('info', 'Session expired.'));
} catch (Guzzle\Http\Exception\CurlException $ge) {
    flash(status('danger', 'Network problem.'));
} catch (Exception $e) {
    flash(status('danger', print_r($e->getMessage(), 1)));
}
