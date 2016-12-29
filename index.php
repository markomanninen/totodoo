<?php

include 'bootstrap.php';

try {

    $app = new Application();

    if ($app->jwt->status == "AUTHENTICATED") {
        flash(status('info', 'Login successful'));
        // init application
        main($app);
    } else if ($app->jwt->status == "LOGOUT") {
        flash(status('info', 'Logout successful'));
        header('Location: index.php');
        exit;
    }

} catch (\Stormpath\Resource\ResourceError $re) {

    //print_err($re);

    flash(status('warning', 'Resource error. Try to <a href="login.php">login</a> again.'));

} catch (ExpiredException $ee) {
    
    //print_err($ee);
    
    flash(status('info', 'Session expired. Try to <a href="login.php">login</a> again.'));

} catch (Guzzle\Http\Exception\CurlException $ge) {
    
    //print_err($ge);

    flash(status('danger', 'There was a problem with network connection.'));

}


$user = $_SESSION['user'];

$status = flash();

$jwtGETResponse = isset($_GET['jwtResponse']) ? $_GET['jwtResponse'] : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.W10.n2s6rPl4Q0XjK2oOWIgzgu9W0kT7I4rYxKM2dewbjr0";

?>
<!DOCTYPE html>
<html>
    <head lang="en">
        <meta charset="UTF-8">
        <title>Totodoo App</title>

        <link rel="stylesheet" href="./bower_components/bootstrap/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="./bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="./src/elonmedia/totodoo/css/style.css">

    </head>
    <body>

        <div class="page-container">

            <nav class="navbar navbar-default">
              <div class="container-fluid">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                  </button>
                  <a class="navbar-brand" href="#">Totodoo</a>
                </div>

                <!-- Collect the nav links, forms, and other content for toggling -->
                <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                  <!--
                  <ul class="nav navbar-nav">
                    <li class="active"><a href="#">Link <span class="sr-only">(current)</span></a></li>
                    <li><a href="#">Link</a></li>
                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Dropdown <span class="caret"></span></a>
                      <ul class="dropdown-menu" role="menu">
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li class="divider"></li>
                        <li><a href="#">Separated link</a></li>
                        <li class="divider"></li>
                        <li><a href="#">One more separated link</a></li>
                      </ul>
                    </li>
                  </ul>

                  <form class="navbar-form navbar-left" role="search">
                    <div class="form-group">
                      <input type="text" class="form-control" placeholder="Search">
                    </div>
                    <button type="submit" class="btn btn-default">Submit</button>
                  </form>
                  -->

                  <ul class="nav navbar-nav navbar-right">

                  <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Lists <span class="caret"></span></a>
                      <ul id="todo-lists" class="dropdown-menu" role="menu"></ul>
                    </li>

                    <?php

                    if (!$user) { ?>
                    
                    <li><a href="register.php">Sign up</a></li>
                    <li><a href="login.php">Login</a></li>

                    <?php } ?>
                    <?php

                    if ($user) { ?>

                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><?=$user['firstname'] . " " . $user['lastname'];?> <span class="caret"></span></a>
                      <ul class="dropdown-menu" role="menu">
                        <li><a href="#">Profile</a></li>
                        <!--
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        -->
                        <li class="divider"></li>
                        <li><a href="logout.php">Logout</a></li>
                      </ul>
                    </li>

                    <?php } ?>
                  </ul>
                </div><!-- /.navbar-collapse -->
              </div><!-- /.container-fluid -->
            </nav>

            <div class="container-fluid">
<!--
                <div class="row">
                </div>

                <div class="row">

                    <div class="col-md-12">


                        <h1>STORMPATH JS TEST</h1>

                        <?=$status?>

                        <ul>
                            <li>asdf</li>
                        </ul>

                    </div>
                </div>
-->
                <div id="app">

                <section id="todoapp">
                
                    <div class="row">
                        <div class="col-md-12">
                            <header id="header">
                                <h1><span data-bind="" id="listName">{name}</span></h1>             
                                <input id="new-todo" placeholder="What needs to be done?" autofocus>
                            </header>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-md-12">
                            <section id="main">
                                <input id="toggle-all" type="checkbox" />
                                <label for="toggle-all">Mark all as complete</label>
                                <ul id="todo-list"></ul>
                            </section>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <footer id="footer">
                                <span id="todo-count"></span>
                                <ul id="filters">
                                    <li>
                                        <a href="#/all" class="selected">All</a>
                                    </li>
                                    <li>
                                        <a href="#/active">Active</a>
                                    </li>
                                    <li>
                                        <a href="#/completed">Completed</a>
                                    </li>
                                </ul>
                                <button id="clear-completed">Clear completed</button>
                            </footer>
                        </div>
                    </div>
                                        
                </section>

                    <div class="row">
                        <div class="col-md-12">
                            <footer id="info"><!--
                                <p>Double-click to edit a todo</p>-->
                                <p>Created by <a href="http://twitter.com/oscargodson">Oscar Godson</a></p>
                                <p>Refactored by <a href="https://github.com/markomanninen">Marko Manninen</a></p>
                                <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
                            </footer>
                        </div>
                    </div>   

                </div>

            </div>

        </div>

        <script type="text/javascript" src="./bower_components/jquery/dist/jquery.min.js"></script>
        <script type="text/javascript" src="./bower_components/jquery-ui/jquery-ui.min.js"></script>
        <script type="text/javascript" src="./bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
        <script type="text/javascript" src="./bower_components/amplify/lib/amplify.min.js"></script>
        
        <script type="text/javascript" src="./bower_components/modelobserver/dist/modelobserver.min.js"></script>

        <script type="text/javascript" src="./src/elonmedia/totodoo/js/totodoo.js"></script>
        <script>

            amplify.request.define( "lists", "ajax", {
                url: "data.php",
                dataType: "json",
                type: "GET"
            });

            $(document).ready(function() {
                init();
            });

            function init() {

                amplify.request( "lists", function( lists ) {
                    var ttd = totodoo(lists);
                });

            }

        </script>

    </body>
</html>
<?php

unset($_SESSION['flash']);

?>