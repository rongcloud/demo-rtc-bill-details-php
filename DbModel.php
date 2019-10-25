<?php
class DbModel
{
    /**
     * 唯一实例
     */
    private static $_instance = null;
    /**
     * 数据库连接句柄
     */
    public $_db = null;
    /**
     * 数据库连接配置
     */
    private $_dbConfig = [
        'host' => 'test',
        'username' => 'test',
        'password' => 'test',
        'dbname' => 'rtc',
        'port' => 3306,
        'charset' => 'UTF8'
    ];

    public function __construct() {
        $this->_db = $this->getConnection($this->_dbConfig);
    }

    public function __destruct()
    {
        if (is_a($this->_db,'mysqli')) {
            $this->_db->close();
        }
    }

    /**
     * 唯一实例
     */
    public static function getInstance() {
        if (self::$_instance === null) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function getLastInsertId() {
        return self::getInstance()->_db->insert_id;
    }

    /**
     * 连接数据库
     * @param array $dbConfig
     * @return mysqli
     * @throws Exception
     */
    private function getConnection($dbConfig = []) {
        mysqli_report(MYSQLI_REPORT_OFF);
        try {
            if(count($dbConfig) === 0) {
                throw new Exception('数据库配置错误');
            }
            $conn = new mysqli($dbConfig['host'],$dbConfig['username'],$dbConfig['password'],$dbConfig['dbname'],$dbConfig['port']);
            if ($conn->connect_error) {
                throw new Exception("数据库连接失败",1006);
            }
            $conn->query('SET NAMES ' . $dbConfig['charset']);
            return $conn;
        } catch (Exception $e) {
            die("数据库连接错误");
        }
    }

    /**
     * 查询多行结果集
     * @param $sql
     * @return array
     * @throws Exception
     */
    public function fetchAll($sql = '') {
        if (!$sql) {
            $sql = "SELECT * FROM rtc_conversation_detail" ;
        }
        $result = $this->_db->query($sql);
        if (!$result) {
            //die("数据库查询错误");
        }
        $arr = array();
        while ($data = $result->fetch_array (MYSQLI_ASSOC)){
            $arr[] = $data;
        }
        return $arr;
    }

    /**
     * 查询一行结果集
     * @param $sql
     * @return array
     * @throws Exception
     */
    public function fetchRow($sql) {
        $result = $this->_db->query($sql);
        if (!$result) {
            die("数据库查询错误");
        }
        $data = $result->fetch_assoc();
        return $data;
    }

    /**
     * 更新记录
     * @param $sql
     * @return int|string
     * @throws Exception
     */
    public function executeSql($sql) {
        $sql = trim($sql);
        $result = $this->_db->query($sql);
        if (!$result) {
            die("sql语句错误");
        }
        switch (strtoupper(substr($sql,0,6))) {
            case 'INSERT':
                $res = $this->_db->insert_id;
                break;
            case 'UPDATE':
            case 'DELETE':
                $res = $this->_db->affected_rows;
                break;
            default:
                $res = '';
                break;
        }
        return $res;
    }

    public function Curl($url = '', $params = array(), $httpHeader = []) {
        if (empty($url)) {
            return false;
        }
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $httpHeader);

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); //处理http证书问题
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_DNS_USE_GLOBAL_CACHE, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        if ($result === false) {
            $result = curl_errno($ch);
        }
        curl_close($ch);
        return $result;
    }

}
