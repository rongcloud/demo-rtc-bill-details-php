<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <script src="js/jquery.min.js"></script>
    <script src="js/jquery.form.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
</head>
<body>
<div class="container-fluid" style="width: 80%;margin-top: 20px;">
    <div>RTC 会话详单(多人会话 单个人员多次进出会统计没次的通话时长，未接通的不显示统计数据)</div>
    <table class="table table-bordered table-striped" style="margin-top: 20px">
        <thead>
        <tr>
            <th class="text-center" width="10%">appKey</th>
            <th class="text-center" width="5%">会话名称</th>
            <th class="text-center" width="15%">会话人员</th>
            <th class="text-center" width="5%">会话类型</th>
            <th class="text-center" width="10%">开始时间</th>
            <th class="text-center" width="10%">结束时间</th>
        </tr>
        </thead>
        <tbody>
            <?php
                require "DbModel.php";
                include('dao/Page.php');
                include('dao/Base.php');
            ini_set('date.timezone','Asia/Shanghai');
            ?>
            <?php
            $pageSiage = 10;
            $page=isset($_GET['page']) ? $_GET['page'] : 1; //页码
            $start = ($page-1)*$pageSiage;

            $Sql = "select * from (SELECT *,min(`start`) as starttime,max(`end`) as endtime,group_concat(subscribeUserId,' - ',times) as detail_info FROM rtc_conversation_detail group by appKey,channelId,pushUserId) t limit {$start},{$pageSiage}" ;
            $result = DbModel::getInstance()->fetchAll($Sql);
            $channelIdList = array_keys(Base::arrayToAssoc($result,"channelId"));
            $countSql = "SELECT * FROM rtc_conversation_detail group by appKey,channelId,pushUserId";
            $count = DbModel::getInstance()->fetchRow($countSql);
            $count = !empty($count) ? count($count) : 0;     //总记录数
            $showPages = 10; //需要显示的页数
            $p=new Page($count,$showPages,$page,$pageSiage);
            $rtcConversationTypeList = ['音频','视频','音频+视频'];
            if ($result) {
            foreach ($result as $k => $v){
                ?>
                <tr>
                    <td><?php echo $v['appKey'];?></td>
                    <td><?php echo $v['channelId'];?></td>
                    <td><?php echo $v['pushUserId'].($v['callUser']==$v['pushUserId']?"(主叫)":"")."<br/>";
                        $detail = explode(",",$v['detail_info']);
                        foreach ($detail as $d){
                            $info = explode(" - ",$d);
                            echo $info[0];
                            if($info[0] == $v['callUser']){
                                echo "(主叫) ";
                            }
                            echo " 时长".Base::timeString($info[1])."<br/>";
                        }
                    ?></td>
                    <td><?php echo isset($rtcConversationTypeList[$v['type']])?$rtcConversationTypeList[$v['type']]:"";?></td>
                    <td><?php echo $v['start']?date("Y-m-d H:i:s",floor($v['start']/1000))." ".substr($v['start'],10,3):"";?></td>
                    <td><?php echo $v['end']?date("Y-m-d H:i:s",floor($v['end']/1000))." ".substr($v['end'],10,3):"";?></td>
                </tr>
            <?php }?>

    <?php }?>
        </tbody>
    </table>
    <div id="pager" style="margin-top: 10px; padding-bottom: 40px;padding-left: 15px;">
        <?php  echo $p->showPages(1);?>
    </div>
</div>
</body>
</html>