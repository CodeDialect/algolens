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
            Assert(Txn.note() == Bytes("post-algolens")),
            Assert(Txn.application_args.length() == Int(2)),
            App.globalPut(self.Variables.post, post),
            App.globalPut(self.Variables.time, Global.latest_timestamp()),
            App.globalPut(self.Variables.post_by, postedby),
            App.globalPut(self.Variables.owner_address, owner),    
            Approve()
        ])
        
        return update_state
    
    def application_update(self):
        post = Txn.application_args[1]
        
        update_state = Seq([
            Assert(Txn.sender() == App.globalGet(self.Variables.owner_address)),
            Assert(Txn.application_args.length() == Int(2)),
            App.globalPut(self.Variables.post, post),
            App.globalPut(self.Variables.time, Global.latest_timestamp()),
            Approve()
        ])
        
        return update_state
    
    def application_deletion(self):
        return Seq([
            Assert(Txn.sender() == App.globalGet(self.Variables.owner_address)),
            Approve()
        ])
    
    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.NoOp, self.application_noop()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
        )
    
    def application_noop(self):
        action = Txn.application_args[0]
        return Cond(
            [action == Bytes("update_post"), self.application_update()],
        )
    
    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
