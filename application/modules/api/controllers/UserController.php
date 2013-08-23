<?php
/**
 * @author Jens De Wulf <jdw.jensdewulf@gmail.com>
 */
class Api_UserController extends REST_Controller
{
    /**
     * Get all the users
     */
    public function indexAction()
    {
        $l = new bored_DataAdapter();
        $db = $l->getConnection();
        
        $sql = 'SELECT user_id, username, email, firstname, surname, gender, picture, createddate, lastloggedindate, activationdate FROM users';
        $stmnt = $db->prepare($sql);
        $stmnt->_execute();
        
        $result = $stmnt->fetchAll();
        
        if (empty($result)) {
            $this->view->message = "No users found.";
        }  else {
            //Zend_Debug::dump($result);exit();
            foreach ($result as $key => $l) {
                $json = $l["answers"];
                $jsonbetter = json_decode($json);
                unset($l["answers"]);
                $l["answers"] = $jsonbetter;
                unset($result[$key]);
                $result[$key] = $l;
            }
            
            $this->view->users = $result;
        }
        
        $this->_response->ok();
    }

    /**
     * Get the headers of the GET method, no body
     */
    public function headAction()
    {
        $this->_response->ok();
    }

    /**
     * Get a single dataset by id
     */
    public function getAction()
    {
        $id = $this->_getParam('id', 0);
        
        $l = new bored_DataAdapter();
        $db = $l->getConnection();
        
        $sql = 'SELECT user_id, username, email, firstname, surname, gender, picture, createddate, lastloggedindate, 
                activationdate FROM users WHERE user_id =:id'
        ;
        
        $stmnt = $db->prepare($sql);
        $vals = array(":id" => $id);  
        $stmnt->_execute($vals);
        
        $result = $stmnt->fetchall();
        
         if (empty($result)) {
            $this->view->message = "No user found with id " . $id;
        }  else {
            
        }
        
        $this->_response->ok();
    }
    
}