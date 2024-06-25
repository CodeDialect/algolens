from pyteal import compileTeal, Mode
from marketplace_contract import SocialMedia

if __name__ == "__main__":
    social_media_contract = SocialMedia()
    
    approval_program = social_media_contract.approval_program()
    clear_program = social_media_contract.clear_program()

    # Mode.Application specifies that this is a smart contract
    compiled_approval = compileTeal(approval_program, Mode.Application, version=6)
    print(compiled_approval)
    with open("marketplace_approval.teal", "w") as teal:
        teal.write(compiled_approval)
        teal.close()

    compiled_clear = compileTeal(clear_program, Mode.Application, version=6)
    print(compiled_clear)
    with open("marketplace_clear.teal", "w") as teal:
        teal.write(compiled_clear)
        teal.close()
