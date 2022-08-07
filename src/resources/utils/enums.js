const MemberRoleEnum = {
    OWNER:0,
    ADMIN:1,
    USER:2,
    ALL_OPTIONS: [0,1,2]
}

const MemberStatusEnum = {
    ACTIVE:0,
    INVITED:1,
    ALL_OPTIONS: [0,1]
}
module.exports = {
    MemberRoleEnum: MemberRoleEnum,
    MemberStatusEnum: MemberStatusEnum
}