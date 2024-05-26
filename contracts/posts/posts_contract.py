from pyteal import *

class Posts:
    class Variables:
        post = Bytes("POST")
        time = Bytes("TIME")
        post_by = Bytes("POSTBY")
        owner_address = Bytes("OWNER")
            
    def application_creation(self):
        post = Txn.application_args[0]
        postedby = Txn.application_args[1]
        owner = Txn.sender()
        
        update_state = Seq([
            App.globalPut(self.Variables.post, post),
            App.globalPut(self.Variables.time, Global.latest_timestamp()),
            App.globalPut(self.Variables.post_by, postedby),
            App.globalPut(self.Variables.owner_address, owner),    
            Approve()
        ])
        
        return update_state
    
    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
        )
    
    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())
    
    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))