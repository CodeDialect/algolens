from pyteal import *

class SocialMedia:
    class GlobalVariables:
        username = Bytes("USERNAME")
        owner = Bytes("OWNER")
        price = Bytes("PRICE")
        login_status = Bytes("LOGINSTATUS")
        profile_picture = Bytes("PICTURE")
        
    class AppMethods:
        signup = Bytes("signup")
        login = Bytes("login")
        logout = Bytes("logout")
        update_picture = Bytes("update_picture")
        check_post = Bytes("check_post")
        
    def application_creation(self):
        return Seq([
            Assert(Txn.note() == Bytes("user-algolens")),
            Assert(Txn.application_args.length() == Int(2)),
            App.globalPut(self.GlobalVariables.username, Txn.application_args[0]),
            App.globalPut(self.GlobalVariables.owner, Txn.sender()),
            App.globalPut(self.GlobalVariables.price, Txn.application_args[1]),
            Approve()
        ])

    def signup(self):
        username = Txn.application_args[1]
        valid_number_of_transactions = Global.group_size() == Int(2)
        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].amount() == Btoi(App.globalGet(self.GlobalVariables.price)),
            Gtxn[1].sender() == Gtxn[0].sender()
        )
    
        can_signup = And(valid_number_of_transactions, valid_payment_to_seller)
        update_state = Seq([
            App.globalPut(self.GlobalVariables.username, username),
            App.globalPut(self.GlobalVariables.owner, Txn.sender()),
            App.globalPut(self.GlobalVariables.price, Int(0)),
            App.globalPut(self.GlobalVariables.login_status, Int(0)),
            App.globalPut(self.GlobalVariables.profile_picture, Bytes("")),
            Approve()
        ])
        
        return If(can_signup).Then(update_state).Else(Reject())

    def login(self):
        username = Txn.application_args[1]
        assert_valid_username = App.globalGet(self.GlobalVariables.username) == username
        assert_valid_owner = App.globalGet(self.GlobalVariables.owner) == Txn.sender()
        assert_login_status = App.globalGet(self.GlobalVariables.login_status) == Int(0)
        validateUser = And(assert_valid_username, assert_valid_owner, assert_login_status)
        
        update_state = Seq([
            App.globalPut(self.GlobalVariables.login_status, Int(1)),
            Approve()
        ])
    
        return If(validateUser).Then(update_state).Else(Reject())
    
    def logout(self):
        username = Txn.application_args[1]
        assert_valid_username = App.globalGet(self.GlobalVariables.username) == username
        assert_valid_owner = App.globalGet(self.GlobalVariables.owner) == Txn.sender()
        assert_login_status = App.globalGet(self.GlobalVariables.login_status) == Int(1)
        validateUser = And(assert_valid_username, assert_valid_owner, assert_login_status)

        update_state = Seq([
            App.globalPut(self.GlobalVariables.login_status, Int(0)),
            Approve()
        ])
        
        return If(validateUser).Then(update_state).Else(Reject())    
    
    def check_post(self):
        username = Txn.application_args[1]
        assert_valid_username = App.globalGet(self.GlobalVariables.username) == username
        assert_owner = App.globalGet(self.GlobalVariables.owner) == Txn.sender()
        assert_login_status = App.globalGet(self.GlobalVariables.login_status) == Int(1)
        
        validateUser = And(assert_valid_username, assert_owner, assert_login_status)
        
        return If(validateUser).Then(Approve()).Else(Reject())
    
    def update_picture(self):
        username = Txn.application_args[1]
        profile_picture = Txn.application_args[2]
        
        assert_valid_username = App.globalGet(self.GlobalVariables.username) == username
        assert_valid_owner = App.globalGet(self.GlobalVariables.owner) == Txn.sender()
        assert_login_status = App.globalGet(self.GlobalVariables.login_status) == Int(1)
        validateUser = And(assert_valid_username, assert_valid_owner, assert_login_status)
        
        update_state = Seq([
            App.globalPut(self.GlobalVariables.profile_picture, profile_picture),
            Approve()
        ])
        
        return If(validateUser).Then(update_state).Else(Reject())
    

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.application_args[0] == self.AppMethods.signup, self.signup()],
            [Txn.application_args[0] == self.AppMethods.login, self.login()],
            [Txn.application_args[0] == self.AppMethods.logout, self.logout()],
            [Txn.application_args[0] == self.AppMethods.update_picture, self.update_picture()],
            [Txn.application_args[0] == self.AppMethods.check_post, self.check_post()]
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))