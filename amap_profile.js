/*
* 高德地图“我的页面”精简脚本
* 过滤了：互动专区, 个性化导航, 成就勋章, 一周成长, 达人任务, 我的车, 借钱, 好友动态, 语音包, 车标, 喜迎财神等
*/
var obj = JSON.parse($response.body);

if (obj.data && obj.data.cardList) {
    // 定义需要删除的卡片 dataKey
    const blockKeys = [
        "PopularActivitiesCard",       // 互动专区
        "MineGoodsDisplayCard",        // 个性化导航
        "MineUserEmblemCard",          // 成就勋章
        "MineStatisticCard",           // 一周成长
        "MineMemberRecommendTaskCard", // 达人任务
        "UserCircleCard",              // 好友动态
        "MineNewDoubleRowCard",        // 我的车、借钱 (二者同属一个大卡片)
        "MineNewVirtualAssetCard",     // 语音包、车标 (二者同属一个大卡片)
        "HappyNewYearCard"             // 喜迎财神、开宝箱、扫街年味 (同属活动卡片)
    ];

    // 类似 jq 的 select 过滤操作
    obj.data.cardList = obj.data.cardList.filter(item => !blockKeys.includes(item.dataKey));
}

$done({body: JSON.stringify(obj)});