<?php

class Application {

    var $jwt = array();
    var $loggedUser = array();
    var $requestToken = array();
    var $resources = array();

    var $loginLink = NULL;
    var $logoutLink = NULL;
    var $registerLink = NULL;
    var $passwordResetLink = NULL;

    var $applications = NULL;
    var $application = NULL;
    var $builder = NULL;
    var $client = NULL;

    function __construct() {
        $this->builder = new \Stormpath\ClientBuilder();
        $this->setJWTResponse();
    }

    function jwtDefault() {
        return isset($_GET['jwtResponse']) ? $_GET['jwtResponse'] : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.W10.n2s6rPl4Q0XjK2oOWIgzgu9W0kT7I4rYxKM2dewbjr0";
    }

    function setJWTResponse($response = NULL) {
        #sub = href
        #irt = token
        #echo JWT::encode(array(), ''); #eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.W10.n2s6rPl4Q0XjK2oOWIgzgu9W0kT7I4rYxKM2dewbjr0
        if (!$response) {
            $response = $this->jwtDefault();
        }
        $this->jwt = JWT::decode($response);
    }

    function setClient() {
        if (!$this->client && $this->builder) {
            $this->builder = new \Stormpath\ClientBuilder();
            if (file_exists(STORMPATH_API_KEYS)) {
                $this->client = $this->builder->setApiKeyFileLocation(STORMPATH_API_KEYS)->build();
            } else {
                $apiKeyProperties = "apiKey.id=".getenv('STORMPATH_API_ID')."\napiKey.secret=".getenv('STORMPATH_API_KEY');
                $this->client = $this->builder->setApiKeyProperties($apiKeyProperties)->build();
            }
        }
        return $this->client;
    }

    function getClient() {
        return $this->setClient();
    }

    function setApplications() {
        if (!$this->applications) {
            if ($client = $this->getClient()) {
                $this->applications = $client->tenant->applications;
            }
        }
        return $this->applications;
    }

    function getApplications() {
        return $this->setApplications();
    }

    function getApplication() {
        if (!$this->application) {
            $this->application = \Stormpath\Resource\Application::get(STORMPATH_APPLICATION_ID);
        }
        return $this->application;
    }

    function getLogoutLink() {
        if (!$this->logoutLink) {
            if ($app = $this->getApplication()) {
                $this->logoutLink = $app->createIdSiteUrl(['logout'=>true, 'callbackUri' => STORMPATH_CALLBACK_URI]);
            }
        }
        return $this->logoutLink;
    }

    function getRegisterLink() {
        if (!$this->registerLink) {
            if ($app = $this->getApplication()) {
                $this->registerLink = $app->createIdSiteUrl(['path'=>'/#/register', 'callbackUri' => STORMPATH_CALLBACK_URI]);
            }
        }
        return $this->registerLink;
    }

    function getPasswordResetLink() {
        if (!$this->passwordResetLink) {
            if ($app = $this->getApplication()) {
                $this->passwordResetLink = $app->createIdSiteUrl(['path'=>'/#/forgot', 'callbackUri' => STORMPATH_CALLBACK_URI]);
            }
        }
        return $this->passwordResetLink;
    }

    function getLoginLink() {
        if (!$this->loginLink) {
            if ($app = $this->getApplication()) {
                $this->loginLink = $app->createIdSiteUrl(['callbackUri' => STORMPATH_CALLBACK_URI]);
            }
        }
        return $this->loginLink;
    }

    function requestToken() {
        if (!$this->requestToken) {
            if ($link = $this->getLoginLink()) {
                parse_str(parse_url($link, PHP_URL_QUERY), $this->requestToken);
            }
        }
        return $this->requestToken;
    }

    function getResource($href, $resource) {
        if (!isset($this->resources[$resource])) {

            if (!$href) {
                if ($this->jwt) {
                    $href = $this->jwt->sub;
                } else if ($token = $this->requestToken()) {
                    $href = $token['sub'];
                }
            }

            if ($client = $this->getClient()) {
                switch($resource) {
                    case ACCOUNT:
                        $this->resources[$resource] = $client->dataStore->getResource($href, \Stormpath\Stormpath::ACCOUNT);
                        break;
                    case APPLICATION;
                        $this->resources[$resource] = $client->dataStore->getResource($href, \Stormpath\Stormpath::APPLICATION);
                        break;
                    case DIRECTORY;
                        $this->resources[$resource] = $client->dataStore->getResource($href, \Stormpath\Stormpath::DIRECTORY);
                        break;
                    case GROUP;
                        $this->resources[$resource] = $client->dataStore->getResource($href, \Stormpath\Stormpath::GROUP);
                        break;
                    case GROUPMEMBERSHIPS;
                        $this->resources[$resource] = $client->dataStore->getResource($href, \Stormpath\Stormpath::GROUPMEMBERSHIPS);
                        break;
                    case ACCOUNTSTOREMAPPINGS;
                        $this->resources[$resource] = $client->dataStore->getResource($href, \Stormpath\Stormpath::ACCOUNTSTOREMAPPINGS);
                        break;
                    case TENANT;
                        $this->resources[$resource] = $client->dataStore->getResource($href, \Stormpath\Stormpath::TENANT);
                        break;
                    default:
                        break;
                }
            }
        }
        return isset($this->resources[$resource]) ? $this->resources[$resource] : NULL;
    }

    function getAccount($href = NULL) {
        
        return $this->getResource($href, ACCOUNT);

    }
}

function callbackURI() {
    return strtolower(substr($_SERVER["SERVER_PROTOCOL"],0,strpos( $_SERVER["SERVER_PROTOCOL"],'/'))).'://'.$_SERVER['HTTP_HOST'].(SERVER_ROOT?'/'.trim(SERVER_ROOT, '/'):'').'/index.php';
}

function print_err($err) {
    print '<pre>';
    print_r($err);
    print '</pre>';
}

function flash($message=NULL) {
    if (!isset($_SESSION['flash'])) $_SESSION['flash'] = array();
    if (isset($message)) {
        $_SESSION['flash'][] = $message;
    } else {
        $message = implode('', $_SESSION['flash']);
        unset($_SESSION['flash']);
        return $message;
    }
}

function status($type, $message) {
    $title = strtoupper($type);
    return <<<eol
    <div class="alert alert-$type">
        <a href="#" class="close" data-dismiss="alert">&times;</a>
        <strong>$title!</strong> $message
    </div>
eol;
}


function main($app) {

    if (!$_SESSION['user']) {
    
        $account = $app->getAccount();

        $groups = array(); $group_permissions = array(); $group_roles = array();

        foreach ($account->getGroups() as $group) {
            $groups[] = $group->name;
            $group_permissions = array_merge((array)$group->customData->permissions, $group_permissions);
            $group_roles = array_merge((array)$group->customData->roles, $group_roles);
        }

        $_SESSION['user'] = array(

            'firstname' => $account->givenName,
            'middlename' => $account->middleName,
            'lastname' => $account->surname,
            'email' => $account->email,
            'mobile' => $account->customData->mobile,
            'birthdate' => $account->customData->birthdate,
            'addresses' => array_map(function($v) {return (array)$v;}, (array)$account->customData->addresses),
            'roles' => array_unique(array_merge((array)$account->customData->roles, $group_roles)),
            'permissions' => array_merge((array)$account->customData->permissions, $group_permissions),
            'groups' => $groups

        );

        $access = $_SESSION['user']['permissions'];

        $application_roles = (array)$app->getApplication()->customData->roles;

        foreach ($_SESSION['user']['roles'] as $role) {
            $access = array_merge($access, $application_roles[$role]);
        }
        
        $_SESSION['user']['permissions'] = array_unique($access);

        $public_lists = array();
        foreach ($account->customData->totodoo->lists as $list) {
            $public_lists[] = (array)$list;
        }

        $sharedLists = array();

        $_SESSION['user']['privateLists'] = $public_lists;
        $_SESSION['user']['sharedLists'] = $sharedLists;

    }

    if (LIST_APPLICATIONS) {

        $tenant = \Stormpath\Resource\Tenant::get();

        echo "APPS:<br/>";
        foreach ($tenant->applications as $app) {
            print "$app->name : $app->href<br/>";
        }

        echo "DIRS:<br/>";
        foreach ($tenant->directories as $dir) {
            print "$dir->name : $dir->href<br/>";
        }

        #print_r(getResource($href, APPLICATION));
        #print_r(getResource($href, DIRECTORY));
        #print_r(getResource($href, ACCOUNT));
        #print_r(getResource($href, GROUP));
        #print_r(getResource($href, GROUPMEMBERSHIPS));
        #print_r(getResource($href, ACCOUNTSTOREMAPPINGS));
        #print_r(getResource($href, TENANT));
        
    }

}
