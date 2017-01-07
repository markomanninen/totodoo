<?php

define('SERVER_ROOT', dirname($_SERVER['SCRIPT_NAME']));

include __DIR__.'/src/elonmedia/totodoo/php/bootstrap.php';
include __DIR__.'/src/elonmedia/totodoo/php/authenticate.php';

$user = isset($_SESSION['user']) ? $_SESSION['user'] : array();

$status = flash();

$jwtGETResponse = isset($_GET['jwtResponse']) ? $_GET['jwtResponse'] : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.W10.n2s6rPl4Q0XjK2oOWIgzgu9W0kT7I4rYxKM2dewbjr0";

?>
<!DOCTYPE html>
<html>
    <head lang="en">
        <meta charset="UTF-8">
        <title>Totodoo - Sample todo application with StormPath user management service</title>
        <link rel="stylesheet" href="./bower_components/bootstrap/dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="./bower_components/bootstrap/dist/css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="./bower_components/bootstrap-submenu/dist/css/bootstrap-submenu.min.css">
        <link rel="stylesheet" href="./src/elonmedia/totodoo/css/animate.css">
        <link rel="stylesheet" href="./src/elonmedia/totodoo/css/style.css">
    </head>
    <body>

        <div id="addNewList" class="modal fade" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <form class = "form-horizontal" id="myForm" method="post" action="index.php" role="form">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                            <h4 class="modal-title">Create a new list</h4>
                        </div>
                        <div class="modal-body">
                            <p>
                                Please enter a name for the list:
                            </p>

                            <div class="form-group">

                                <div class="col-lg-12">
                                    <label class="control-label" for="name">Name</label>
                                    <input type="text" class="form-control required" id="name" name="name" />
                                </div>
                            </div>

                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                            <button id="myFormSubmit" class="btn btn-primary">Send</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

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
                  <a class="navbar-brand" href="#"><span class="glyphicon glyphicon-text-size"> Totodoo</span></a>
                </div>
<!--
                <div class="navbar-header">
                <h1 class="navbar-nav nav navbar">
                    <button disabled type="button" id="myButton" class="btn btn-danger" autocomplete="off"></button>
                </h1>
                </div>
-->
                  <div class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                      <li class="dropdown">
                        <a tabindex="0" data-toggle="dropdown"><span class="glyphicon glyphicon-th-list"> Lists</span> <span class="caret"></span></a>

                        <!-- role="menu": fix moved by arrows (Bootstrap dropdown) -->
                        <ul class="dropdown-menu" role="menu" id="todo-lists">

                            <?php if (!$user) { ?>
                            <li class="disabled"><a disabled tabindex="0" id="addNewList">Create a new list</a></li>
                            <?php } else { ?>
                            <li><a tabindex="0" data-toggle="modal" data-target="#addNewList" id="addNewList">Create a new list</a></li>
                            <?php } ?>
                            <li class="divider"></li>

                            <li class="dropdown-submenu">

                                <a tabindex="1" data-toggle="dropdown">Public lists</a>

                                <ul class="dropdown-menu" id="publicLists">
                                </ul>

                            </li>

                            <?php if ($user) { ?>
                            <li class="dropdown-submenu">

                                <a tabindex="2" data-toggle="dropdown">Shared lists</a>

                                <ul class="dropdown-menu" id="sharedLists">
                                </ul>

                            </li>

                            <li class="dropdown-submenu">

                                <a tabindex="3" data-toggle="dropdown">Private lists</a>

                                <ul class="dropdown-menu" id="privateLists">
                                </ul>

                            </li>
                            <?php } ?>
<!--
                            <li class="divider"></li>

                            <li><a tabindex="4">Preferences</a></li>
--> 
                        </ul>
                      </li>
                    </ul>

<!--
                  <form class="navbar-form navbar-left" role="search">
                    <div class="form-group">
                      <input type="text" class="form-control" placeholder="Search">
                    </div>
                    <button type="submit" class="btn btn-default">Submit</button>
                  </form>
-->               

                  <ul class="nav navbar-nav navbar-right">

                    <?php

                    if (!$user) { ?>
                    
                    <li><a href="./?action=register">Sign up</a></li>
                    <li><a href="./?action=login"><span class="glyphicon glyphicon-log-in"></span> Login</a></li>

                    <?php } ?>
                    <?php

                    if ($user) { ?>

                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><span class="glyphicon glyphicon-bell"> Notifications</span> <span class="caret"></span></a>
                      <ul id="notifications" class="dropdown-menu" role="menu">

                        <div class="notifications-wrapper"></div>
                        <!--
                        <li>
                            <a href="#"><span class="glyphicon glyphicon-user"></span> Profile</a>
                            <div class="nav navbar-text progress" style="height: 10px; width: 200px; margin-top: 10px; padding-right: 5px;">
                                <div class="bar" style="width: 30%;"></div>
                                <div class="pull-right" style="font-size: 8px;">1/3</div>
                            </div>
                        </li>

                        <li>
                            <a href="#"><span class="glyphicon glyphicon-user"></span> Profile</a>
                            <div class="progress" style="height: 18px; font-size: 8px; margin: 5px 10px;">
                              <div class="progress-bar" role="progressbar" aria-valuenow="10"
                              aria-valuemin="0" aria-valuemax="100" style="width:70%">
                                7/10
                              </div>
                              
                              <div class="pull-right" style="font-size: 8px; margin-top: -4px">7/10</div>
                            
                            </div>
                        </li>
                        -->
                        
                      </ul>
                    </li>

                    <li class="dropdown">
                      <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><?=$user['firstname'] . " " . $user['lastname'];?> <span class="glyphicon glyphicon-user"></span> <span class="caret"></span></a>
                      <ul class="dropdown-menu" role="menu">
                        <li><a href="#"><span class="glyphicon glyphicon-user"></span> Profile</a></li>
                        <li class="divider"></li>
                        <li><a href="./?action=logout"><span class="glyphicon glyphicon-log-out"></span> Logout</a></li>
                      </ul>
                    </li>

                    <?php } ?>
                  </ul>
                </div><!-- /.navbar-collapse -->
              </div><!-- /.container-fluid -->
            </nav>

            <div class="container-fluid">

                <div id="app">

                <?=$status?>

                <section id="todoapp">
                
                    <div class="row">
                        <div class="col-md-12">
                            <header id="header">   
                                <h1><span data-bind="" class="single-line" id="listName">Loading...</span></h1>  
                            </header>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12">
                            <header id="header">           
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
                            <footer id="info">
                                <!--<p>Double-click to edit a todo</p>-->
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
        <script type="text/javascript" src="./bower_components/remarkable-bootstrap-notify/dist/bootstrap-notify.min.js"></script>
        <script type="text/javascript" src="./bower_components/bootstrap-submenu/dist/js/bootstrap-submenu.min.js"></script>
        <script type="text/javascript" src="./bower_components/sprintf/dist/sprintf.min.js"></script>
        <script type="text/javascript" src="./bower_components/modelobserver/dist/modelobserver.min.js"></script>
        <script type="text/javascript" src="./src/elonmedia/totodoo/js/totodoo.js"></script>
        <script>

            var ttd; // todo application instance

            $(document).ready(function() {
                init();
            });

            function init() {
                amplify.request( "lists", function( lists ) {
                    ttd = totodoo(lists, <?=isset($user['privateLists'])?1:0?>);
                });
            }

        </script>

    </body>
</html>
<?php

unset($_SESSION['flash']);

?>