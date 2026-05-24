<?php
/**
 * Cliente REST para Supabase (PostgreSQL vía PostgREST).
 * Compatible PHP 7.4+ · InfinityFree
 */

require_once __DIR__ . '/config.php';

class SupabaseClient
{
    private $url;
    private $key;
    private $useServiceRole;

    public function __construct($useServiceRole = true)
    {
        $this->url = rtrim(SUPABASE_URL, '/');
        $this->key = $useServiceRole ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;
        $this->useServiceRole = $useServiceRole;
    }

  /**
   * SELECT con filtros PostgREST.
   * @param string $table
   * @param array $params query string: select, eq, order, limit, offset
   */
    public function select($table, array $params = [])
    {
        $query = [];
        if (!empty($params['select'])) {
            $query[] = 'select=' . urlencode($params['select']);
        }
        if (!empty($params['eq'])) {
            foreach ($params['eq'] as $col => $val) {
                $query[] = $col . '=eq.' . rawurlencode((string) $val);
            }
        }
        if (!empty($params['gte'])) {
            foreach ($params['gte'] as $col => $val) {
                $query[] = $col . '=gte.' . rawurlencode((string) $val);
            }
        }
        if (!empty($params['lte'])) {
            foreach ($params['lte'] as $col => $val) {
                $query[] = $col . '=lte.' . rawurlencode((string) $val);
            }
        }
        if (!empty($params['ilike'])) {
            foreach ($params['ilike'] as $col => $val) {
                $query[] = $col . '=ilike.' . rawurlencode($val);
            }
        }
        if (!empty($params['order'])) {
            $query[] = 'order=' . urlencode($params['order']);
        }
        if (isset($params['limit'])) {
            $query[] = 'limit=' . (int) $params['limit'];
        }
        if (isset($params['offset'])) {
            $query[] = 'offset=' . (int) $params['offset'];
        }
        if (!empty($params['is'])) {
            foreach ($params['is'] as $col => $val) {
                $query[] = $col . '=is.' . $val;
            }
        }

        $path = '/rest/v1/' . rawurlencode($table);
        if ($query) {
            $path .= '?' . implode('&', $query);
        }
        return $this->request('GET', $path);
    }

    public function selectOne($table, array $params = [])
    {
        $params['limit'] = 1;
        $rows = $this->select($table, $params);
        return is_array($rows) && count($rows) > 0 ? $rows[0] : null;
    }

    public function count($table, array $eq = [])
    {
        $query = ['select' => 'count'];
        if ($eq) {
            $query['eq'] = $eq;
        }
        $headers = ['Prefer: count=exact'];
        $path = '/rest/v1/' . rawurlencode($table) . '?select=id';
        if (!empty($eq)) {
            $parts = [];
            foreach ($eq as $col => $val) {
                $parts[] = $col . '=eq.' . rawurlencode((string) $val);
            }
            $path .= '&' . implode('&', $parts);
        }
        $result = $this->request('HEAD', $path, null, $headers, true);
        return isset($result['count']) ? (int) $result['count'] : 0;
    }

    public function insert($table, array $data)
    {
        return $this->request('POST', '/rest/v1/' . rawurlencode($table), $data, [
            'Prefer: return=representation',
        ]);
    }

    public function update($table, array $eq, array $data)
    {
        $parts = [];
        foreach ($eq as $col => $val) {
            $parts[] = $col . '=eq.' . rawurlencode((string) $val);
        }
        $path = '/rest/v1/' . rawurlencode($table) . '?' . implode('&', $parts);
        return $this->request('PATCH', $path, $data, [
            'Prefer: return=representation',
        ]);
    }

    public function delete($table, array $eq)
    {
        $parts = [];
        foreach ($eq as $col => $val) {
            $parts[] = $col . '=eq.' . rawurlencode((string) $val);
        }
        $path = '/rest/v1/' . rawurlencode($table) . '?' . implode('&', $parts);
        return $this->request('DELETE', $path);
    }

    /** Llamada RPC (funciones PostgreSQL expuestas en Supabase) */
    public function rpc($fn, array $params = [])
    {
        return $this->request('POST', '/rest/v1/rpc/' . rawurlencode($fn), $params);
    }

    /** Auth: login con email/password (anon key) */
    public function authLogin($email, $password)
    {
        $client = new SupabaseClient(false);
        return $client->request('POST', '/auth/v1/token?grant_type=password', [
            'email' => $email,
            'password' => $password,
        ]);
    }

    /** Auth: registrar usuario móvil */
    public function authRegister($email, $password, array $metadata = [])
    {
        $client = new SupabaseClient(false);
        return $client->request('POST', '/auth/v1/signup', [
            'email' => $email,
            'password' => $password,
            'data' => $metadata,
        ]);
    }

    private function request($method, $path, $body = null, array $extraHeaders = [], $returnHeaders = false)
    {
        $ch = curl_init($this->url . $path);
        $headers = array_merge([
            'apikey: ' . $this->key,
            'Authorization: Bearer ' . $this->key,
            'Content-Type: application/json',
        ], $extraHeaders);

        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);

        if ($method === 'HEAD') {
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_HEADER, true);
        }

        if ($body !== null && $method !== 'HEAD') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new RuntimeException('cURL: ' . $error);
        }

        if ($returnHeaders && $method === 'HEAD') {
            $headerStr = substr($response, 0, $headerSize);
            $count = 0;
            if (preg_match('/content-range:\s*\*\/(\d+)/i', $headerStr, $m)) {
                $count = (int) $m[1];
            }
            return ['count' => $count, 'code' => $httpCode];
        }

        if ($response === '' || $response === false) {
            if ($httpCode >= 200 && $httpCode < 300) {
                return [];
            }
            throw new RuntimeException('Supabase HTTP ' . $httpCode);
        }

        $decoded = json_decode($response, true);
        if ($httpCode >= 400) {
            $msg = is_array($decoded) && isset($decoded['message']) ? $decoded['message'] : $response;
            throw new RuntimeException('Supabase: ' . $msg, $httpCode);
        }

        return $decoded;
    }
}
