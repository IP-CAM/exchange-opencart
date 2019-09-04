var selectedCard;
var $paymentForm = $('#all_secure_exchange_form');
var $paymentFormSubmitButton = $("#all_secure_exchange_form_submit");
var $paymentFormCardTypeInput = $('#all_secure_exchange_card_type');
var $paymentFormTokenInput = $('#all_secure_exchange_token');

$('button[data-card-type]').on('click', function () {
    selectCard($(this).data('cardType'));
});

$paymentFormSubmitButton.on('click', function () {
    submitForm();
});

var selectCard = function (cardType) {
    var card = cards[cardType];
    if (!card) {
        return;
    }
    selectedCard = card;

    /**
     * reset
     */
    allSecureExchangeSeamless.reset();
    $paymentFormSubmitButton.prop("disabled", true);

    /**
     * show selection
     */
    $('button[data-card-type]').removeClass('btn-success');
    $('button[data-card-type="' + card.type + '"]').addClass('btn-success');

    /**
     * set form data
     */
    $paymentFormCardTypeInput.val(selectedCard.type);

    /**
     * seamless integration
     */
    if (card.integrationKey) {
        allSecureExchangeSeamless.init(
            card.integrationKey,
            function () {
                $paymentFormSubmitButton.prop("disabled", true);
            },
            function () {
                $paymentFormSubmitButton.prop("disabled", false);
            });
        return;
    }

    /**
     * redirect integration
     */
    $paymentFormSubmitButton.prop("disabled", false);
};

var submitForm = function (e) {
    /**
     * seamless integration
     */
    if (selectedCard.integrationKey) {
        allSecureExchangeSeamless.submit(
            function (token) {
                $paymentFormTokenInput.val(token);
                $paymentForm.submit();
            },
            function (errors) {
                errors.forEach(function (error) {
                    console.error(error);
                });
            });
        return;
    }
    /**
     * redirect integration
     */
    $paymentForm.submit();
};

/**
 * seamless
 */
var allSecureExchangeSeamless = function () {
    var payment;
    var validDetails;
    var validNumber;
    var validCvv;
    var _invalidCallback;
    var _validCallback;
    var $seamlessForm = $('#all_secure_exchange_seamless');
    var $seamlessCardHolderInput = $('#all_secure_exchange_seamless_card_holder', $seamlessForm);
    var $seamlessEmailInput = $('#all_secure_exchange_seamless_email', $seamlessForm);
    var $seamlessExpiryMonthInput = $('#all_secure_exchange_seamless_expiry_month', $seamlessForm);
    var $seamlessExpiryYearInput = $('#all_secure_exchange_seamless_expiry_year', $seamlessForm);
    var $seamlessCardNumberInput = $('#all_secure_exchange_seamless_card_number', $seamlessForm);
    var $seamlessCvvInput = $('#all_secure_exchange_seamless_cvv', $seamlessForm);

    var init = function (integrationKey, invalidCallback, validCallback) {
        _invalidCallback = invalidCallback;
        _validCallback = validCallback;

        $seamlessForm.show();
        var style = {
            'border': 'none',
            'height': '32px',
            'padding': '6px 12px',
            'font-size': '14px',
            'color': '#555',
        };
        payment = new PaymentJs("1.2");
        payment.init(integrationKey, $seamlessCardNumberInput.prop('id'), $seamlessCvvInput.prop('id'), function (payment) {
            payment.setNumberStyle(style);
            payment.setCvvStyle(style);
            payment.numberOn('input', function (data) {
                validNumber = data.validNumber;
                validate();
            });
            payment.cvvOn('input', function (data) {
                validCvv = data.validCvv;
                validate();
            });
        });
        $('input, select', $seamlessForm).on('input', validate);
    };

    var validate = function () {
        $('.form-group', $seamlessForm).removeClass('has-error');
        $seamlessCardNumberInput.closest('.form-group').toggleClass('has-error', !validNumber);
        $seamlessCvvInput.closest('.form-group').toggleClass('has-error', !validCvv);
        validDetails = true;
        if (!$seamlessCardHolderInput.val().length) {
            $seamlessCardHolderInput.closest('.form-group').addClass('has-error');
            validDetails = false;
        }
        if (validNumber && validCvv && validDetails) {
            _validCallback.call();
            return;
        }
        _invalidCallback.call();
    };

    var reset = function () {
        $seamlessForm.hide();
    };

    var submit = function (success, error) {
        payment.tokenize(
            {
                card_holder: $seamlessCardHolderInput.val(),
                month: $seamlessExpiryMonthInput.val(),
                year: $seamlessExpiryYearInput.val(),
                email: $seamlessEmailInput.val()
            },
            function (token, cardData) {
                success.call(this, token);
            },
            function (errors) {
                error.call(this, errors);
            }
        );
    };

    return {
        init: init,
        reset: reset,
        submit: submit,
    };
}();

if ($('button[data-card-type]').length === 1) {
    setTimeout(function () {
        selectCard($('button[data-card-type]').first().data('cardType'));
    }, 500);
}
