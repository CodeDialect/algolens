from pyteal import *

class SocialMedia:
    class Variables:
        username = Bytes("USERNAME")
        owner = Bytes("OWNER")
        price = Bytes("PRICE")
        login_status = Bytes("LOGINSTATUS")
        post_count = Bytes("POSTCOUNT")
    class AppMethods:
        signup = Bytes("signup")
        login = Bytes("login")
        logout = Bytes("logout")
        check_post = Bytes("check_post")
 
    def application_creation(self):
        return Seq([
            App.globalPut(self.Variables.username, Txn.application_args[0]),
            App.globalPut(self.Variables.owner, Txn.sender()),
            App.globalPut(self.Variables.price, Int(1)),
            Approve()
        ])

    def signup(self):
        username = Txn.application_args[1]
        price = Int(1)  # Set a fixed price for username signup
        
        valid_number_of_transactions = Global.group_size() == Int(2)

        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].amount() == price,
            Gtxn[1].sender() == Gtxn[0].sender()
        )
    
        can_signup = And(valid_number_of_transactions, valid_payment_to_seller)
        update_state = Seq([
            App.globalPut(self.Variables.username, username),
            App.globalPut(self.Variables.owner, Txn.sender()),
            App.globalPut(self.Variables.price, Int(0)),
            App.globalPut(self.Variables.login_status, Int(0)),
            Approve()
        ])
        
        return If(can_signup).Then(update_state).Else(Reject())

    def login(self):
        username = Txn.application_args[1]
        assert_valid_username = App.globalGet(self.Variables.username) == username
        assert_valid_owner = App.globalGet(self.Variables.owner) == Txn.sender()
        assert_login_status = App.globalGet(self.Variables.login_status) == Int(0)
        validateUser = And(assert_valid_username, assert_valid_owner, assert_login_status)
        
        update_state = Seq([
            App.globalPut(self.Variables.login_status, Int(1)),
            Approve()
        ])
    
        return If(validateUser).Then(update_state).Else(Reject())
    
    def logout(self):
        username = Txn.application_args[1]
        assert_valid_username = App.globalGet(self.Variables.username) == username
        assert_valid_owner = App.globalGet(self.Variables.owner) == Txn.sender()
        assert_login_status = App.globalGet(self.Variables.login_status) == Int(1)
        validateUser = And(assert_valid_username, assert_valid_owner, assert_login_status)

        update_state = Seq([
            App.globalPut(self.Variables.login_status, Int(0)),
            Approve()
        ])
        
        return If(validateUser).Then(update_state).Else(Reject())
    
    def check_post(self):
        username = Txn.application_args[1]
        
        assert_valid_username = App.globalGet(self.Variables.username) == username
        assert_valid_login = App.globalGet(self.Variables.login_status) == Int(1)
        assert_owner_address = App.globalGet(self.Variables.owner) == Txn.sender()
        
        can_post = And(assert_valid_username, assert_valid_login, assert_owner_address)
        
        approve_post = Seq([
           Approve() 
        ])
        
        return If(can_post).Then(approve_post).Else(Reject())

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.application_args[0] == self.AppMethods.signup, self.signup()],
            [Txn.application_args[0] == self.AppMethods.login, self.login()],
            [Txn.application_args[0] == self.AppMethods.logout, self.logout()],
            [Txn.application_args[0] == self.AppMethods.check_post, self.check_post()],
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))