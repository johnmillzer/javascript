/**
 * @name Qunar Home Banner Modifier
 * @description 修改去哪儿首页顶部Banner为单张指定图片，并禁止滚动
 */

const targetImage = "https://raw.githubusercontent.com/johnmillzer/Icon/main/plugin/gpstool.png";

let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 辅助函数：修改图片链接
        const modifyItem = (item) => {
            if (!item) return item;
            // 常见的图片字段名，遍历替换以防万一
            const imageKeys = ['imgUrl', 'imageUrl', 'picUrl', 'image', 'iconUrl'];
            imageKeys.forEach(key => {
                if (item.hasOwnProperty(key)) {
                    item[key] = targetImage;
                }
            });
            // 可选：清除点击跳转动作，防止误触
            // item.scheme = "";
            // item.jumpUrl = "";
            return item;
        };

        // 定位数据源：去哪儿该接口结构多变，尝试几种常见路径
        // 目标是将列表截断为长度 1，从而实现“不滚动”的效果
        
        let targetList = null;
        let listType = ""; // 用于标记找到的是哪个字段

        if (obj && obj.data) {
            if (Array.isArray(obj.data)) {
                targetList = obj.data;
                listType = "root";
            } else if (obj.data.bannerList && Array.isArray(obj.data.bannerList)) {
                targetList = obj.data.bannerList;
                listType = "bannerList";
            } else if (obj.data.list && Array.isArray(obj.data.list)) {
                targetList = obj.data.list;
                listType = "list";
            }
        }

        // 如果找到了列表，且列表不为空
        if (targetList && targetList.length > 0) {
            // 1. 取出第一个元素并修改图片
            let firstItem = modifyItem(targetList[0]);
            
            // 2. 将列表重置为只包含这一个元素的数组
            if (listType === "root") {
                obj.data = [firstItem];
            } else if (listType === "bannerList") {
                obj.data.bannerList = [firstItem];
            } else if (listType === "list") {
                obj.data.list = [firstItem];
            }
        }

        $done({ body: JSON.stringify(obj) });

    } catch (e) {
        console.log("Qunar Banner Script Error: " + e);
        $done({});
    }
} else {
    $done({});
}