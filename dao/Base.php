<?php

class Base
{
    public static function write($msg) {
        $record = "\n".date('Y-m-d H:m:s') . " >>> " . ' ' . "\t" . $msg;
        $base = dirname(__FILE__)."/../upload/log";
        $dest = $base . "/" . date("Ymd", time()) . 'log.txt';
        if (!file_exists($dest)) {
            @mkdir($base, 0777, TRUE);
            @file_put_contents($dest, $record, FILE_APPEND);
        }
        if (file_exists($dest)) {
            @file_put_contents($dest, $record, FILE_APPEND);
        }
    }
    public static function makeHttpHeader($arr) {
        $nonce = mt_rand();
        $time = time();
        $sign = sha1($arr['appSecret'] . $nonce . $time);
        $httpHeader = array(
            "Content-type: application/json;charset='utf-8'",
            'App-Key:' . $arr['appKey'],
            'Nonce:' . $nonce,
            'Timestamp:' . $time,
            'Signature:' . $sign,
        );
        return $httpHeader;
    }
    /**
     * 将一个二维数组按照多个列进行排序，类似 SQL 语句中的 ORDER BY
     *
     * 用法：
     * @code php
     * $rows = Helper_Array::sortByMultiCols($rows, array(
     * 'parent' => SORT_ASC,
     * 'name' => SORT_DESC,
     * ));
     * @endcode
     *
     * @param array $rowset 要排序的数组
     * @param array $args 排序的键
     *
     * @return array 排序后的数组
     */
    public static function sortByMultiCols($rowset, $args) {
        if (empty($rowset) || !is_array($rowset))
            return array();
        $sortArray = array();
        $sortRule = '';
        foreach ($args as $sortField => $sortDir) {
            foreach ($rowset as $offset => $row) {
                $sortArray[$sortField][$offset] = $row[$sortField];
            }
            $sortRule .= '$sortArray[\'' . $sortField . '\'], ' . $sortDir . ', ';
        }
        if (empty($sortArray) || empty($sortRule)) {
            return $rowset;
        }
        eval('array_multisort(' . $sortRule . '$rowset);');
        return $rowset;
    }
    static function sortByCol($array, $keyname, $dir = SORT_ASC) {
        return self::sortByMultiCols($array, array($keyname => $dir));
    }
    public static function Cutstr($sourcestr, $cutlength = 20, $ellipsis = true) {
        $returnstr = '';
        $i = 0;
        $n = 0;
        $str_length = strlen($sourcestr); //字符串的字节数
        while (($n < $cutlength) and ( $i <= $str_length)) {
            $temp_str = substr($sourcestr, $i, 1);
            $ascnum = Ord($temp_str); //得到字符串中第$i位字符的ascii码
            if ($ascnum >= 224) {    //如果ASCII位高与224，
                $returnstr = $returnstr . substr($sourcestr, $i, 3); //根据UTF-8编码规范，将3个连续的字符计为单个字符
                $i = $i + 3;            //实际Byte计为3
                $n++;            //字串长度计1
            } elseif ($ascnum >= 192) { //如果ASCII位高与192，
                $returnstr = $returnstr . substr($sourcestr, $i, 2); //根据UTF-8编码规范，将2个连续的字符计为单个字符
                $i = $i + 2;            //实际Byte计为2
                $n++;            //字串长度计1
            } elseif ($ascnum >= 65 && $ascnum <= 90) { //如果是大写字母，
                $returnstr = $returnstr . substr($sourcestr, $i, 1);
                $i = $i + 1;            //实际的Byte数仍计1个
                $n++;            //但考虑整体美观，大写字母计成一个高位字符
            } else {                //其他情况下，包括小写字母和半角标点符号，
                $returnstr = $returnstr . substr($sourcestr, $i, 1);
                $i = $i + 1;            //实际的Byte数计1个
                $n = $n + 0.5;        //小写字母和半角标点等与半个高位字符宽...
            }
        }
        /* if ($str_length > $cutlength) {
          $returnstr = $returnstr . "..."; //超过长度时在尾处加上省略号
          } */
        if($ellipsis == true){
            $returnstr .= trim($returnstr) == $sourcestr ? '' : "..."; //超过长度时在尾处加上省略号
        }
        return $returnstr;
    }
    /**
     * 将数组转为关联数组,暂时只支持二维数组
     * 主要用于将数据库查询的结果转变为以主键为Key的关联数组,和将其中某个值提取出来,
     *
     * @param  array $array  二维数组
     * @param  string $key   二维数组中的关联key
     * @param  $isOldArray   返回多个 list
     * @param  bool         为true时只返回包含指定key的值的一维数组
     *
     * @return array        以指定key对应的值作为key的关联数组
     */
    public static function arrayToAssoc ($array, $key = '', $onlyKey = false, $isOldArray = false)
    {
        $map = [];
        if (!is_array($array)) {
            return $map;
        }

        if (isset($array[$key]) && !is_array($array[$key]) && !is_object($array[$key])) {
            return $array[$key];
        }

        foreach ($array as $value) {
            if (isset($value[$key]) && !is_array($value[$key]) && !is_object($value[$key])) {

                if ($isOldArray) {
                    $map[$value[$key]][] = $value;
                } else if ($onlyKey) {
                    $map[] = $value[$key];
                } else {
                    $map[$value[$key]] = $value;
                }
            } else {
                continue;
            }
        }

        return $map;
    }
    /**
     * 将数组转为关联数组, 三维关联数组
     * 主要用于将数据库查询的结果转变为以主键为Key的关联数组,和将其中某个值提取出来,
     *
     * @param  array $array 二维数组
     * @param  string $key  二维数组中的关联key
     */
    public static function arrayToThreeAssoc ($list, $filed1 = "", $filed2 = "")
    {
        if (!$list || !$filed1 || !$filed2)
            return $list;
        $newList = [];
        foreach ($list as $v) {
            if (isset($v[$filed1]) && isset($v[$filed2])) {
                $newList[$v[$filed1]][$v[$filed2]] = $v;
            }
        }

        return $newList;
    }

    /**
     ********************************************************************************
     * 时间秒转换成时分秒格式
     ********************************************************************************
     *
     * @param int $seconds
     *
     * @return string
     */
    public static function timeString ($mseconds = 0)
    {
        $seconds = $mseconds/1000;
        $hour = intval($seconds / 3600);
        $min = intval($seconds % 3600 / 60);
        $second = intval($seconds % 3600 % 60);
        $mseconds = $mseconds%1000;
        $timeString = '';
        if ($hour) {
            $timeString .= " {$hour} h";
        }

        if ($min) {
            $timeString .= " {$min} min";
        };

        if ($second) {
            $timeString .= " {$second} s";
        }
        if ($mseconds) {
            $timeString .= " {$mseconds} ms";
        }

        return $timeString;
    }
}
