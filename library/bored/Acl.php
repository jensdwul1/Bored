<?php
class bored_Acl extends Zend_Acl
{
    const ROLE_USER = 'ROLE_USER';
    const ROLE_ALL   =  null       ;
    const ROLE_GUEST = 'ROLE_GUEST';

    public function __construct()
    {
        $this->addRole(self::ROLE_GUEST                         )
             ->addRole(self::ROLE_USER , array(self::ROLE_GUEST))
             ->allow(  self::ROLE_GUEST                         )
             ->_addModuleDefault()
             ->_addAPIModule()
        ;
    }
    
    protected function _addAPIModule()
    {
        
        $r = array();
        $r['error'] = self::getResource('error', 'api');
        $r['dataset'] = self::getResource('dataset', 'api');
        $r['user'] = self::getResource('user', 'api');
        
        $this->addResources($r);
         return $this->allow(self::ROLE_GUEST, $r['error'])
                    ->allow(self::ROLE_GUEST, $r['dataset'])
                    ->allow(self::ROLE_GUEST, $r['user'])
        ;
    }
    
    protected function _addModuleDefault()
    {
        $r = array();
        $r['error'] = self::getResource('error');
        $r['index'] = self::getResource('index');
        $r['account'] = self::getResource('account');
        $r['user'] = self::getResource('user');

        $this->addResources($r);
        //Zend_Debug::dump($this->_resources);exit();
         return $this->allow(self::ROLE_GUEST, $r['error'])
                    ->allow(self::ROLE_GUEST, $r['index'])
                    ->allow(self::ROLE_GUEST, $r['account'])
                    ->allow(self::ROLE_USER, $r['user'])
                    ->deny(self::ROLE_GUEST, $r['user'])
        ;
    }
    
    public function addResources($resources = array()) {
        foreach ($resources as $resource) {
            $this->addResource($resource);
        }

        return $this;
    }

   
    public static function getResource($controller = 'index', $module = 'default')
    {
        $class_name = ucfirst($controller) . 'Controller';

        if ($module != 'default') {
            $class_name = ucfirst($module) . "_{$class_name}";
        }

        return $class_name;
    }

    
    public static function getPrivilege($action = 'index')
    {
        $method_name = lcfirst($action) . 'Action';

        return $method_name;
    }
}