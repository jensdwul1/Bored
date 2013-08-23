<?php

class bored_Controller_Plugin_Acl extends Zend_Controller_Plugin_Abstract
{
    protected $_acl;

    public function __construct()
    {
        $session = new Zend_Session_Namespace('bored_acl');
        
        if ( isset($session->acl) ) {
            $this->_acl = $session->acl;
        } else
            $this->_acl = new bored_Acl();
            $session->acl = $this->_acl;
        
    }

    public function preDispatch(Zend_Controller_Request_Abstract $request)
    {
        
        parent::preDispatch($request);
        
        $auth = Zend_Auth::getInstance();
        $role = $auth->hasIdentity() ? $auth->getStorage()->read()['role'] : bored_Acl::ROLE_GUEST; // PHP 5.4!

        $resource = bored_Acl::getResource($request->getControllerName(),
                                         $request->getModuleName());
        
        $privilege = bored_Acl::getPrivilege($request->getActionName());
        
        
        if ($this->_acl->isAllowed($role, $resource, $privilege)) {
            return true;
        }
        throw new Zend_Exception("Access violation for Role '{$role}': no access to resource '{$resource}' for privilege '{$privilege}'");
    }
}