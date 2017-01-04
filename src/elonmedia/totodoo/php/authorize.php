<?php

function authorize() {

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

    }
}
