<?php

class IndexController extends Zend_Controller_Action
{

    protected $_auth = null;

    public function init()
    {
        $this->_auth = Zend_Auth::getInstance();
    }

    public function indexAction()
    {
        $this->view->headTitle("Index");
        //Do nothing but show some information from view
    }
	public function aboutAction()
    {
        $this->view->headTitle("About");
        //Do nothing but show some information from view
    }
	public function funAction()
    {
        $this->view->headTitle("Fun Spots");
        $userMapper = new Application_Model_UserMapper();
        $users = $userMapper->fetchAll();
        $us = array();
        foreach ($users as $value) {
            if ($value->getActivationdate() != null && $value->getDeleteddate() == null) {
                array_push($us, $value);
            }
        }
        $view->assign('users',$us);
    }
}