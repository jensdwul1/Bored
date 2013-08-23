<?php

class AccountController extends Zend_Controller_Action
{

    protected $_auth = null;

    public function init()
    {
        $this->_auth = Zend_Auth::getInstance();
    }

    public function loginAction()
    {
        $form = new Application_Form_Login();

        $view = $this->view;
        $view->headTitle("Login");

        $request = $this->getRequest();

        if ($request->isPost() ) {
            if ($form->isValid( $request->getPost() )) {
                $values = $form->getValues();
                
                $valuesFiltered = array();
                foreach ($values as $key => $value) {
                    if ($key != "break" && $key != "forgot") {
                        $valuesFiltered[$key] = $value;
                    }
                }
                $user = new Application_Model_User($valuesFiltered);
                
                $adapter = new bored_Auth_Adapter_User($user->getUsername(),
                                                      $user->getPassword());
                                                           
                
                $this->_auth->authenticate($adapter);

                if ($this->_auth->hasIdentity() ) {
                    $user_data = $adapter->getResultRowObject();
                    
                    $this->_auth->getStorage()->write(array('role' => bored_Acl::ROLE_USER,
                                                            'id'   => (int) $user_data->user_id,
                                              ));
                    $userMapper = new Application_Model_UserMapper();
                    
                    $u = new Application_Model_User($userMapper->read($user_data->user_id));
                    $now = new DateTime('now');
                    $logind = $now->format('Y-m-d H:i:s');
                    $u->setLastloggedindate($logind);
                    
                    $userMapper->save($u);
                    
                    
                    return $this->redirect('user/index');
                } else {
                    $view->error = "Authentication failed";
                    
                }
            }
        }
        $view->form = $form;
        
    }

    public function registerAction()
    {
        $form = new Application_Form_Register();

        $view = $this->view;
        $view->headTitle("Register");

        $request = $this->getRequest();

        if ($request->isPost()) {
            
            //$values = $form->getValues();
            //$form->populate($values);
            $val = $request->getPost();
            
            if ($form->isValid($val)) {
                $user = new Application_Model_User();
                $user->setUsername($val["username"]);
                $user->setPasswordraw($val["passwordraw"]);
                $user->setFirstname($val["firstname"]);
                $user->setSurname($val["surname"]);
                $user->setEmail($val["email"]);
                $user->setGender($val["gender"]);
                $user->setActivationkey(bored_Utility::randomString(64));
                $now = new DateTime('now');
                $createdd = $now->format('Y-m-d H:i:s');
                $user->setCreateddate( $createdd );
                
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
                            
                            //SEND AUTHENTICATION MAIL
                            $config = array('auth' => 'login',
                                            'username' => 'boredghent@gmail.com',
                                            'password' => BORED_PWD,
                                            'ssl' => 'ssl',
                                            'port' => '465');

                            $transport = new Zend_Mail_Transport_Smtp('smtp.gmail.com', $config);
                                                        
                            $html = "<table style='width:60%; margin-left:5%'>

                                    <tr>
                                            <th colspan='5' height='100px;' style='border-bottom:1px solid #3a3a3a;'>ACTIVATION MAIL StarInGhent</th>

                                    </tr>
                                    <tr style='height:80px;'>

                                        <td colspan='5' style='font:Verdana, Geneva, sans-serif; font-weight:bold;font-size:24px;'>Welcome " . $user->getUsername() . " to Bored!</td>
                                    </tr>
                                    <tr style='height:40px;'>

                                        <td colspan='5'><a href='http://localhost/Bored/public/account/activate?id=". $user->getId() ."&key=". $user->getActivationkey() ."' style='color:#3e3e3e; text-decoration:underline;'>Activate your account now!</a></td>
                                    </tr>
                                    <tr>

                                        <td colspan='5'>Link not working? Try copying this link into your browser:</td>
                                    </tr>
                                    <tr>
                                        <td colspan='5'>http://localhost/Bored/public/account/activate?id=". $user->getId() ."&key=". $user->getActivationkey()."</td>
                                    </tr>
                                </table>
                            ";
                            
                            $mail = new Zend_Mail();
                            $mail->setBodyHtml($html);
                            $mail->setFrom('boredghent@gmail.com');
                            $mail->addTo($user->getEmail());
                            $mail->setSubject('bored | Activationlink');
                            $mail->send($transport);
                            
                            return $this->redirect('account/login');
                        }
                        else {
                            throw new Zend_Exception("File not uploaded.");
                       }
                        
                    } 
                    catch (Zend_File_Transfer_Exception $e) {
                        throw new Zend_Exception("file not uploaded well");
                    }
                    catch (Zend_Mail_Exception $e) {
                        throw new Zend_Exception("Mail not sent correctly: " . $e);
                    }
                    catch (Zend_Exception $e) {
                        throw new Zend_Exception("Error: " . $e);
                    }
                }
                else { 
                     //throw new Zend_Exception("file not provided");
                    $userMapper = new Application_Model_UserMapper();
                    
                    $uid = $userMapper->save($user);
                    $user->setId($uid);
                    $config = array('auth' => 'login',
                                    'username' => 'boredghent@gmail.com',
                                    'password' => BORED_PWD,
                                    'ssl' => 'ssl',
                                    'port' => '465');

                    $transport = new Zend_Mail_Transport_Smtp('smtp.gmail.com', $config);

                    $html = "<table style='width:60%; margin-left:5%'>

                                <tr>
                                    <th colspan='5' height='100px;' style='border-bottom:1px solid #3a3a3a;'>ACTIVATION MAIL BORED</th>
                                </tr>
                                <tr style='height:80px;'>
                                    <td colspan='5' style='font:Verdana, Geneva, sans-serif; font-weight:bold;font-size:24px;'>Welcome " . $user->getUsername() . " to bored!</td>
                                </tr>
                                <tr style='height:40px;'>
                                    <td colspan='5'><a href='http://localhost/Bored/public/account/activate?id=". $user->getId() ."&key=". $user->getActivationkey() ."' style='color:#3e3e3e; text-decoration:underline;'>Activate your account now!</a></td>
                                </tr>
                                <tr>
                                    <td colspan='5'>Link not working? Try copying this link into your browser:</td>
                                </tr>
                                <tr>
                                    <td colspan='5'>http://localhost/Bored/public/account/activate?id=". $user->getId() ."&key=". $user->getActivationkey()."</td>
                                </tr>
                            </table>
                    ";
                    try{
                        $mail = new Zend_Mail();
                        $mail->setBodyHtml($html);
                        $mail->setFrom('boredghent@gmail.com');
                        $mail->addTo($user->getEmail());
                        $mail->setSubject('Bored | Activationlink');
                        $mail->send($transport);

                        return $this->redirect('account/login');
                    }
                    catch (Zend_Mail_Exception $e) {
                        throw new Zend_Exception("Mail not sent correctly: " . $e);
                    }
                    catch (Zend_Exception $e) {
                        throw new Zend_Exception("Error: " . $e);
                    }
                }
                
            }
            else { 
               print_r($val);exit();
            }
        }
        $view->form = $form;
    }

    public function activateAction()
    {
        $request = $this->getRequest();

        if ($request->isGet() ) {
            $val = $this->getRequest();
            $id = $_GET['id'];
            $key = $_GET['key'];
            $userMapper = new Application_Model_UserMapper();
            try {
                $user = new Application_Model_User($userMapper->read($id));
               if ($user->getActivationkey() == $key && $user->getActivationdate() == null) {
                    $now = new DateTime('now');
                    $nowF = $now->format('Y-m-d H:i:s');
                    $activationdate = $nowF;
                    $modifieddate = $nowF;
                    $user->setActivationdate($activationdate);
                    $user->setModifieddate($modifieddate);
                    $userMapper->save($user);
                    return $this->redirect('account/login');
                   
               }  else {
                   throw new Zend_Exception("The specified user doesn&apos;t exist, the key provided was incorrect, or the user was already authenticated.");

               }
            }
            catch (Exception $e)
            {
                throw new Zend_Exception($e);
            }
            
        }
        
    }

    public function forgotpasswordAction()
    {
        $form = new Application_Form_Forgotpassword();
        $view = $this->view;
        $view->headTitle("Forgot Password");

        $request = $this->getRequest();

        if ($request->isPost() ) {
            if ($form->isValid( $request->getPost() )) {
                $values = $form->getValues();
                
                $userMapper = new Application_Model_UserMapper();
                
                try{
                    $user = new Application_Model_User($userMapper->readWithvalue('email', trim($values["email"])));
                    
                    if ($user->getUsername() == trim($values["username"])) {
                        $pass = bored_Utility::randomString(6);
                        $user->setPasswordraw($pass);

                        $now = new DateTime('now');
                        $modifieddate = $now->format('Y-m-d H:i:s');
                        $user->setModifieddate($modifieddate);

                        $userMapper->save($user);

                        $config = array('auth' => 'login',
                                             'username' => 'boredghent@gmail.com',
                                             'password' => BORED_PWD,
                                             'ssl' => 'tls',
                                             'port' => '587');

                        $transport = new Zend_Mail_Transport_Smtp('smtp.gmail.com', $config);

                        $html = "<table style='width:60%; margin-left:5%'>

                            <tr>
                                    <th colspan='5' height='100px;' style='border-bottom:1px solid #3a3a3a;'>FORGOT PASSWORD MAIL BORED</th>

                            </tr>
                            <tr style='height:80px;'>

                                <td colspan='5' style='font:Verdana, Geneva, sans-serif; font-weight:bold;font-size:24px;'>Hello " . $user->getUsername() . "!</td>
                            </tr>
                            <tr style='height:40px;'>

                                <td colspan='5'>Your new password is <em>". $pass ."</em>.</td>
                            </tr>
                            <tr style='height:40px;'>

                                <td colspan='5'>You can change this on the edit user page.</td>
                            </tr>

                            </table>
                        ";

                        $mail = new Zend_Mail();
                        $mail->setBodyHtml($html);
                        $mail->setFrom('boredghent@gmail.com');
                        $mail->addTo($user->getEmail());
                        $mail->setSubject('bored | New Password');
                        $mail->send($transport);
                        return $this->redirect('account/login');
                    }
                    else{
                        $view->assign('error', "The username provided does not match the username of the user found with the provided email.");
                    }
                }
                catch (Zend_Mail_Exception $e)
                {
                    throw new Zend_Mail_Exception($e);
                }
                catch (Exception $e)
                {
                   $view->assign('error', "No user found with the provided email. " . $e); 
                }
            }
        }
        $view->form = $form;
    }

    public function logoutAction()
    {
        $this->_auth->clearIdentity();
        return $this->redirect('index');
    }


}




