<?php

class ModelExtensionPaymentAllSecureExchangeCreditCard extends Model
{
    protected $prefix = 'payment_all_secure_exchange_';

    protected $type = 'creditcard';

    public function getMethod($address, $total)
    {
        $prefix = $this->prefix . $this->type;
        $base_url = $this->config->get('config_url');

        $this->load->language('extension/payment/all_secure_exchange_' . $this->type);
        $logo = '<img src="' . $base_url . 'image/catalog/all_secure_exchange/' . $this->type . '.png" />';
        $code = $this->session->data['language'];
        $code = substr($code, 0, 2);
        $title = $logo . ' ' . $this->config->get($prefix . '_title')['en'];
        if (isset($code) && isset($this->config->get($prefix . '_title')[$code])) {
            $title = $logo . ' ' . $this->config->get($prefix . '_title')[$code];
        }

        $method_data = [
            'code' => 'all_secure_exchange_' . $this->type,
            'title' => $title,
            'terms' => '',
            'sort_order' => $this->config->get($prefix . '_sort_order'),
        ];

        return $method_data;
    }
}
