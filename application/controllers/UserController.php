<?php

class UserController extends Zend_Controller_Action
{

    protected $_auth = null;

    public function init()
    {
        $this->_auth = Zend_Auth::getInstance();
    }

    public function indexAction()
    {
        $auth = Zend_Auth::getInstance();
        $id = $auth->getStorage()->read()['id'];
        $userMapper = new Application_Model_UserMapper();
        $user = new Application_Model_User($userMapper->read($id));
        $view = $this->view;
        $view->headTitle("User Profile");
        
        $view->assign('username',$user->getUsername());
        $view->assign('firstname',$user->getFirstname());
        $view->assign('surname',$user->getSurname());
        $view->assign('email',$user->getEmail());
        $view->assign('gender',$user->getGender());
        $view->assign('lastloggedindate',$user->getLastloggedindate());
        $view->assign('createddate',$user->getCreateddate());
        $view->assign('picture',$user->getPicture());
        }

    public function editAction()
    {
        $this->view->headTitle("Edit User Profile");
        $form = new Application_Form_Register();
        $form->removeElement('username');
        $form->removeElement('submit');
        $form->removeElement('passwordraw');
        $form->removeElement('passwordcheck');
        
        $password = new Zend_Form_Element_Password('passwordraw');
        $password
                    ->setLabel("Change password")
                    ->addFilter('StringTrim')
                    ->setAttrib('id','register-pwd')
                    ->setAttrib('placeholder','Password')
                    ->setAttrib('tabindex', '11')
                    ->setAttrib('class', 'form-field input-xxlarge')
                    ->setDecorators(array(
                                        'ViewHelper',
                                        array('Errors', array ('class' => 'help-inline')),
                                        array(
                                            'Label',
                                            array('placement' => 'prepend',
                                            )
                                        )
                                    ))
                    ->setOrder(17);
        ;
        
        $passwordcheck = new Zend_Form_Element_Password('passwordcheck');
        $passwordcheck
                    ->setLabel("Repeat new password")
                    ->addFilter('StringTrim')
                    ->addValidator('Identical', false, array('token' => 'passwordraw'))
                    ->setAttrib('id','register-pwdRpt')
                    ->setAttrib('placeholder','Repeat password')
                    ->setAttrib('tabindex', '12')
                    ->setAttrib('class', 'form-field input-xxlarge')
                    ->setDecorators(array(
                                        'ViewHelper',
                                        array('Errors', array ('class' => 'help-inline')),
                                        array(
                                            'Label',
                                            array('placement' => 'prepend',
                                            )
                                        )
                                    ))
                    ->setOrder(18);
        ;
        
        $submit = new Zend_Form_Element_Submit('submit');
        $submit->setLabel('Submit changes')
                ->setOptions(array('class' => 'btn pillBtn'))
                ->setAttrib('id', 'register-btn')
                ->setAttrib('tabindex', '13')
                ->setDecorators(array('ViewHelper',array('Errors', array ('class' => 'help-inline'))))
                ->setOrder(20);
        ;
        $form->addElement($password);
        $form->addElement($passwordcheck);
        $form->addElement($submit);
        
        
        $view = $this->view;
        $view->title = 'Edit User Profile';
        
        $auth = Zend_Auth::getInstance();
        $id = $auth->getStorage()->read()['id'];
        if($id >0)
        {
            $userMapper = new Application_Model_UserMapper();
            $user = new Application_Model_User($userMapper->read($id));
           
            $users = array();
            
            $img = $user->getPicture();
            if (!empty($img)) 
            {
                $url = PUBLIC_PATH . "/images/" . $img;
                $url = join("/",explode("\\",$url));
                $url = explode("htdocs/", $url)[1];
                //Zend_Debug::dump($_SERVER);exit();
                $view->assign('image', "http://" . $_SERVER["HTTP_HOST"] . "/" . $url);
                $view->assign('hasimage', true);
            }
            else
                $view->assign('hasimage', false);
            
            
            $users['username'] = $user->getUsername();
            $users['firstname'] = $user->getFirstname();
            $users['surname'] = $user->getSurname();
            $users['gender'] = $user->getGender();
            $users['email'] = $user->getEmail();
            
            $form->populate($users);
        }
        else {
            return $this->redirect('account/login/');
        }
        
        
        

        $request = $this->getRequest();

        if ($request->isPost() ) 
        {
            if ($form->isValid( $request->getPost())) 
            {
               $values = $form->getValues();
                $form->populate($values);
                $val = $this->getRequest()->getPost();
                if ($form->isValid( $request->getPost() )) {
                    Zend_debug::dump($val);
                    if(isset($val["passwordraw"]))
                    {
                        $user->setPasswordraw($val["passwordraw"]);
                    }
                    $user->setFirstname($val["firstname"]);
                    $user->setSurname($val["surname"]);
                    $user->setEmail($val["email"]);
                    $user->setGender($val["gender"]);
                    $modifiedd = new DateTime('now', new DateTimeZone('UTC'));
                    $modifiedd = $modifiedd->format('Y-m-d H:i:s');
                    $user->setModifieddate( $modifiedd );
                    
                    if($form->picture->isUploaded())
                    {
                        $mime = $form->picture->getMimeType();
                        $exts = explode('/', $mime);
                        $ext = end($exts);
                        $new_img_name = base64_encode(bored_Utility::randomString(20) . microtime());
                        $form->picture->addFilter('Rename',$new_img_name . '.' . $ext, true);
                        $user->setPicture($new_img_name . '.' . $ext);

                        try {
                            if ($form->picture->receive()) {
                                $userMapper = new Application_Model_UserMapper();
                                $uid = $userMapper->save($user);
                                $user->setId($uid);
                                return $this->redirect('user/index');
                            }
                            else 
                            {
                                throw new Zend_Exception("Your image wasn't received correctly.");
                            }
                        
                        } 
                        catch (Zend_File_Transfer_Exception $e) 
                        {
                            throw new Zend_Exception("Your image was not uploaded.");
                        }
                    }
                    else {
                        $userMapper = new Application_Model_UserMapper();
                        $uid = $userMapper->save($user);
                        $user->setId($uid);
                        return $this->redirect('user/index');
                    }
                }
            }
        }
        $view->form = $form;
    }



}