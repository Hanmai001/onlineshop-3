const adminService = require('../model/adminService')
const authService = require('../model/authService')

let getHomePage = async (req, res) => {
    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    return res.render('index.ejs', { ava })
}
let getAdminProfile = async (req, res) => {
    const { EMAIL: email, FULLNAME: fullname, SEX: sex, PHONE: phone, AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    //console.log({ email, fullname, sex, phone, ava })
    return res.render('admin-profile.ejs', { email, fullname, sex, phone, ava });
}
let getOdersManage = async (req, res) => {
    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    return res.render('oders-manage.ejs', { ava })
}

//SORT USER-MANAGE
let getUsersManage = async (req, res) => {

    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    
    const list = await adminService.getAllUser();
    //console.log(list.length);

    let allUsers;
    const {
        timeCreate: timeCreate,
        sortEmail: sortEmail,
        sortHoTen: sortName,
        sort: sortFilter

    } = req.query;
    if (timeCreate || sortEmail || sortName || sortFilter) {
        allUsers = await adminService.getSortUser(req.query);
    }
    return res.render('users-manage.ejs', { list: list, ava });
}
/////////////////

let getOriginManage = async (req, res) => {
    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    return res.render('origin-manage.ejs', { ava })
}
let getDetailsUser = async (req, res) => {
    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    let idUser = req.params.id;
    const details = await adminService.getUser(idUser);

    //console.log(details);

    return res.render('details-user.ejs', { ava, details: details })
}
let getProductManage = async (req, res) => {
    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    return res.render('product-manage.ejs', { ava })
}
let getTypeManage = async (req, res) => {
    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    return res.render('type-manage.ejs', { ava })
}
let getChangePassword = async (req, res) => {
    const { AVATAR: ava } = await authService.getUserByID(res.locals.user.id);
    return res.render('change-password-admin.ejs', { ava })
}
let updateInformation = async (req, res) => {
    const idUser = req.params.id;
    const { EMAIL: email, FULLNAME: fullname, SEX: sex, PHONE: phone, AVATAR: ava } = await authService.getUserByID(idUser);
    let new_ava = ava;
    if (req.file) {
        new_ava = '/images/' + req.file.filename;
    }
    const {
        updateFullname: new_fullname,
        updateEmail: new_email,
        updatePhone: new_phone,
        updateSex: new_sex
    } = req.body;

    //console.log(req.body)

    if (new_phone.length > 11) {
        req.flash('updateProfileMsg', 'SĐT phải nhỏ hơn 12 kí tự.');
        return res.redirect(`/admin-profile/${idUser}`);
    }

    const result = await adminService.updateProfile(req.body, new_ava, idUser);
    //console.log(res.locals.user); 
    if (result) {
        return res.redirect(`/admin-profile/${idUser}`);
    }
    req.flash('updateProfileMsg', 'Kiểm tra lại thông tin cập nhật.');
    return res.redirect(`/admin-profile/${idUser}`);

}
let updatePassword = async (req, res) => {
    const {
        curPass,
        newPass,
        confPass
    } = req.body;
    const idUser = req.params.id;
    if (!curPass || !newPass || !confPass) {
        req.flash('updatePassMsg', 'Vui lòng nhập đủ thông tin.');
        return res.redirect(`/change-password-admin/${idUser}`);
    }
    if (curPass.length < 6 || newPass.length < 6 || confPass.length < 6) {
        req.flash('updatePassMsg', 'Mật khẩu phải ít nhất 6 ký tự.');
        return res.redirect(`/change-password-admin/${idUser}`);
    }
    if (newPass !== confPass) {
        req.flash('updatePassMsg', 'Xác nhận mật khẩu không trùng.');
        return res.redirect(`/change-password-admin/${idUser}`);
    }
    //console.log(res.locals.user.username);
    if (!await authService.checkUserCredential(res.locals.user.username, curPass)) {
        //console.log("sai mk");
        req.flash('updatePassMsg', 'Nhập sai mật khẩu hiện tại.');
        return res.redirect(`/change-password-admin/${idUser}`);
    }
    const result = await adminService.updatePassword(req.body, idUser);
    if (result) {
        req.flash('updatePassMsg', 'Đổi mật khẩu thành công.');
        return res.redirect(`/change-password-admin/${idUser}`);
    }
    req.flash('updatePassMsg', 'Đổi mật khẩu thất bại.');
    return res.redirect(`/change-password-admin/${idUser}`);
}
module.exports = {
    getHomePage,
    getAdminProfile,
    getOdersManage,
    getUsersManage,
    getOriginManage,
    getProductManage,
    getTypeManage,
    updateInformation,
    getChangePassword,
    updatePassword,
    getDetailsUser
}