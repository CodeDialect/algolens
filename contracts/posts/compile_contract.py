from pyteal import compileTeal, Mode
from posts_contract import Posts

if __name__ == "__main__":
    posts_contract = Posts()
    
    approval_program = posts_contract.approval_program()
    clear_program = posts_contract.clear_program()

    # Mode.Application specifies that this is a smart contract
    compiled_approval = compileTeal(approval_program, Mode.Application, version=6)
    print(compiled_approval)
    with open("posts_approval.teal", "w") as teal:
        teal.write(compiled_approval)
        teal.close()

    compiled_clear = compileTeal(clear_program, Mode.Application, version=6)
    print(compiled_clear)
    with open("posts_clear.teal", "w") as teal:
        teal.write(compiled_clear)
        teal.close()
