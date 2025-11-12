function makeApiBaseUrl() {
    const domain = window.location.hostname.split('.').slice(-2).join('.');
    return `https://api.${domain}`;
}
const BASEURL = makeApiBaseUrl();

$(function () {
    let checkStepActive = function () {
        return !this.el.hasClass('hidden');
    }
    let activeStep = function (steps = [step1, step2, step3, finish]) {
        for (var index in steps) {
            steps[index].el.addClass('hidden')
        }
        this.el.removeClass('hidden')
    }
    let isValidStep1 = function () {
        let email = this.el.find('#email')
        if (!/^\S+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(email.val())) {
            alert('Please write correct email address.');
            return false;
        }
        return true;
    }

    let isValidStep2 = function () {
        let verifyCode = this.el.find('#code')
        if (!/\d{5}/.test(verifyCode.val())) {
            alert('Please write correct code.');
            return false;
        }
        return true;
    }

    let isValidStep3 = function () {
        let cause = this.el.find('#cause')
        if (cause.val().trim() == '') {
            alert('Please write reason.');
            return false;
        }
        return true;
    }

    let getCodeRequest = function () {
        return $.ajax({
            type: "POST",
            data: this.el.find(':input').serialize(),
            url: BASEURL + '/user/activation',
            headers: {Authorization: 'GuestAccess', Accept: '*/*'},
        })
    }

    let verifyRequest = function () {
        return $.ajax({
            type: "POST",
            url: BASEURL + '/user/activatvate',
            data: this.el.find(':input').serialize() + '&' + step1.el.find(':input').serialize(),
            headers: {Authorization: 'GuestAccess', Accept: '*/*'}
        });
    }

    let deleteAccountRequest = function () {
        return $.ajax({
            type: "GET",
            url: BASEURL + "/user/delete",
            data: this.el.find(':input').serialize(),
            headers: {Authorization: this.data.token, Accept: '*/*'},
        })
    }

    const $el = $('button');
    let step1 = {el: $('.step-1'), isActive: checkStepActive, active: activeStep, isValid: isValidStep1, request: getCodeRequest}
    let step2 = {el: $('.step-2'), isActive: checkStepActive, active: activeStep, isValid: isValidStep2, request: verifyRequest}
    let step3 = {el: $('.step-3'), isActive: checkStepActive, active: activeStep, isValid: isValidStep3, request: deleteAccountRequest}
    let finish = {el: $('.finish'), active: activeStep}

    $el.click(function () {
        if (step1.isActive() && step1.isValid()) {
            step1.request().done(function (response, textStatus, jqXHR) {
                step2.active();
                $el.text('Verify mail');
            })
            return;
        }

        if (step2.isActive() && step2.isValid()) {
            step2.request().done(function (response) {
                step3.active();
                $el.text('Delete account')
                step3.data = {user_id: response.data.user_id, token: response.data.token}
            }).fail(function (response) {
                alert('Your code is incorrect.');
            })
            return;
        }

        if (step3.isActive() && step3.isValid()) {
            step3.request().done(function (response) {
                finish.active();
                $el.addClass('hidden')
            })
        }

    });
});
