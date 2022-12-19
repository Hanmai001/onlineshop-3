const productService = require('../model/productService');
const userService = require('../model/userService');
const authService = require('../model/authService');
const Paginator = require("paginator");
const qs = require('qs');
var paginator = new Paginator(10, 5);

const getPagination = (page, size) => {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

let getHomepage = async (req, res) => {
    let products, allProducts, pagination_info, length;
    const {
        name: nameFilter,
        type: typeFilter,
        brand: brandFilter,
        manufacturer: manufacturerFilter,
        priceFrom: priceFrom,
        priceTo: priceTo,
        numBuy: numBuy,
        sortPrice: sortPrice,
        timeCreate: timeCreate,
        sort: sortFilter,
     
    } = req.query;
    const {
        page, ...withoutPage
    } = req.query;

    let currentPage = req.query.page ? +req.query.page : 1;
    console.log(req.query);
    let random_names = [];
    allProducts = await productService.getAllProduct();
    length = allProducts.length;
    for (let i = 0; i < 6; i++) {
        let num = Math.floor(Math.random() * length);
        let check = true;
        for (let j = 0; j < random_names.length; j++) {
            if (random_names[j] && random_names[j] === allProducts[num].NAMEPRODUCT) {
                check = false
            }

        }
        if (check || random_names.length < 1) {
            random_names.push(allProducts[num].NAMEPRODUCT)
        }
        else i--
    }
    if (nameFilter || typeFilter || manufacturerFilter || brandFilter || priceFrom || priceTo || numBuy || sortPrice || timeCreate || sortFilter) {
        allProducts = await productService.getFilterProducts(req.query);
        length = allProducts.length;
        pagination_info = paginator.build(length, currentPage);
        if (currentPage < 1) currentPage = 1;
        else if (currentPage > pagination_info.total_pages) currentPage = pagination_info.total_pages;
        const { limit, offset } = getPagination(currentPage - 1, req.query.size);
        products = await productService.getFilterProductsPage(req.query, limit, offset);
    }

    else {
        pagination_info = paginator.build(length, currentPage);
        if (currentPage < 1) currentPage = 1;
        else if (currentPage > pagination_info.total_pages) currentPage = pagination_info.total_pages;
        const { limit, offset } = getPagination(currentPage - 1, req.query.size);
        products = await productService.getProductsPage(limit, offset);
    }

    const brands = await productService.getAllBrand();
    const manufacturers = await productService.getAllManufacturer();
    const types = await productService.getAllType();

    let iterator = (currentPage - 5) < 1 ? 1 : currentPage - 4;
    let endingLink = (iterator + 4) <= pagination_info.total_pages ? (iterator + 4) : currentPage + (pagination_info.total_pages - currentPage);

    const originUrl = `${req.baseUrl}?${qs.stringify(withoutPage)}`;
    //console.log("Render2...", qs.parse(originUrl))
    return res.render('home.ejs', {
        originUrl,
        products, brands, types, manufacturers, names: random_names, pagination_info, iterator, endingLink, path: req.url
    });
}
let getDetailProductPage = async (req, res) => {
    let id = req.params.id;

    const product = await productService.getDetailProduct(id);
    const relateProducts = await productService.getRelatedProducts(id);
    const review = await productService.getReview(id);

    return res.render('product-info.ejs', { product: product, relateProducts: relateProducts, review: review });
}
let getListOrderPage = async (req, res) => {
    return res.render('list-order.ejs');
}
let getProfilePage = async (req, res) => {

    return res.render('my-profile.ejs');
}
let updateInformation = async (req, res) => {
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

    //console.log(req.body)

    if (phone.length > 11) {
        req.flash('updateProfileMsg', 'SĐT phải nhỏ hơn 12 kí tự.');
        return res.redirect(`/my-profile/${idUser}`);
    }

    const result = await userService.updateProfile(req.body, ava, idUser);
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
        return res.redirect(`/my-profile/${idUser}`);
    }
    req.flash('updateProfileMsg', 'Kiểm tra lại thông tin cập nhật.');
    return res.redirect(`/my-profile/${idUser}`);
}
let getUpdatePasswordPage = async (req, res) => {
    return res.render('change-password.ejs')

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
        return res.redirect(`/change-password/${idUser}`);
    }
    if (curPass.length < 6 || newPass.length < 6 || confPass.length < 6) {
        req.flash('updatePassMsg', 'Mật khẩu phải ít nhất 6 ký tự.');
        return res.redirect(`/change-password/${idUser}`);
    }
    if (newPass !== confPass) {
        req.flash('updatePassMsg', 'Xác nhận mật khẩu không trùng.');
        return res.redirect(`/change-password/${idUser}`);
    }
    console.log(res.locals.user.username);
    if (!await authService.checkUserCredential(res.locals.user.username, curPass)) {
        //console.log("sai mk");
        req.flash('updatePassMsg', 'Nhập sai mật khẩu hiện tại.');
        return res.redirect(`/change-password/${idUser}`);
    }
    const result = await userService.updatePassword(req.body, idUser);
    if (result) {
        req.flash('updatePassMsg', 'Đổi mật khẩu thành công.');
        return res.redirect(`/change-password/${idUser}`);
    }
    req.flash('updatePassMsg', 'Đổi mật khẩu thất bại.');
    return res.redirect(`/change-password/${idUser}`);
}

let getListOrderStatusPage = async (req, res) => {
    return res.render('status-orders.ejs')
}

let getPaymentPage = async (req, res) => {
    return res.render('payment.ejs');
}
module.exports = {
    getHomepage,
    getDetailProductPage,
    getListOrderPage,
    getProfilePage,
    getUpdatePasswordPage,
    getListOrderStatusPage,
    getPaymentPage,
    updateInformation,
    updatePassword,

}