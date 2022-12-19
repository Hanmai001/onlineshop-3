const adminService = require('../model/adminService')
const authService = require('../model/authService')

let getHomePage = (req, res) => {
    return res.render('index.ejs')
}
let getAdminProfile = (req, res) => {
    return res.render('adminProfile.ejs')
}
let getOdersManage = (req, res) => {
    return res.render('OdersManage.ejs')
}
let getUsersManage = async (req, res) => {

    const list = await adminService.getUser();
    console.log(list.length);
    return res.render('UsersManage.ejs', { list: list });
}
let getOriginManage = (req, res) => {
    return res.render('OriginManage.ejs')
}
let getProductManage = (req, res) => {
    return res.render('ProductManage.ejs')
}
let getTypeManage = (req, res) => {
    return res.render('TypeManage.ejs')
}
let getChangePassword = (req, res) => {
    return res.render('change-password-admin.ejs')
}
let updateInformation = async (req, res) => {
    //console.log(req.file);
    const idUser = req.params.id;
    let ava = res.locals.user.ava;
    if (req.file) {
        ava = '/images/' + req.file.filename;
    }
    const {
        updateFullname: fullname,
        updateEmail: email,
        updatePhone: phone,
        updateSex: sex
    } = req.body;
    if (phone.length > 11) {
        req.flash('updateProfileMsg', 'SĐT phải nhỏ hơn 12 kí tự.');
        return res.redirect(`/adminProfile/${idUser}`);
    }

    const result = await adminService.updateProfile(req.body, ava, idUser);
    //console.log(res.locals.user);
    if (result) {
        if (req.file && ava)
            res.locals.user.ava = ava;
        if (fullname)
            res.locals.user.fullname = fullname;
        if (email)
            res.locals.user.email = email;
        if (phone)
            res.locals.user.phone = phone;
        if (sex && sex === "female")
            res.locals.user.sex = 'Nữ';
        else if (sex && sex === "male")
            res.locals.user.sex = 'Nam';
        else if (sex && sex === "sexOther")
            res.locals.user.sex = 'Khác';
        return res.redirect(`/adminProfile/${idUser}`);
    }
    req.flash('updateProfileMsg', 'Kiểm tra lại thông tin cập nhật.');
    return res.redirect(`/adminProfile/${idUser}`);

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
        return res.redirect(`/changePassword/${idUser}`);
    }
    if (curPass.length < 6 || newPass.length < 6 || confPass.length < 6) {
        req.flash('updatePassMsg', 'Mật khẩu phải ít nhất 6 ký tự.');
        return res.redirect(`/changePassword/${idUser}`);
    }
    if (newPass !== confPass) {
        req.flash('updatePassMsg', 'Xác nhận mật khẩu không trùng.');
        return res.redirect(`/changePassword/${idUser}`);
    }
    //console.log(res.locals.user.username);
    if (!await authService.checkUserCredential(res.locals.user.username, curPass)) {
        //console.log("sai mk");
        req.flash('updatePassMsg', 'Nhập sai mật khẩu hiện tại.');
        return res.redirect(`/changePassword/${idUser}`);
    }
    const result = await adminService.updatePassword(req.body, idUser);
    if (result) {
        req.flash('updatePassMsg', 'Đổi mật khẩu thành công.');
        return res.redirect(`/changePassword/${idUser}`);
    }
    req.flash('updatePassMsg', 'Đổi mật khẩu thất bại.');
    return res.redirect(`/changePassword/${idUser}`);
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
    updatePassword
}