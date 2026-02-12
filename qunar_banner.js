/**
 * @name Qunar Home Banner Modifier (Deep Search & Debug)
 * @description 智能搜索去哪儿首页Banner并替换，包含调试日志
 */

const targetImage = "https://raw.githubusercontent.com/johnmillzer/Icon/main/plugin/gpstool.png";
const DEBUG = true; // 开启日志

function log(msg) {
    if (DEBUG) console.log("⚠️ [Qunar Banner] " + msg);
}

let body = $response.body;

if (body) {
    try {
        let obj = JSON.parse(body);

        // 打印顶层结构，方便调试
        if (obj.data) {
            log("Data Keys: " + Object.keys(obj.data));
        }

        // 修改单个项目的辅助函数
        const modifyItem = (item) => {
            const imgKeys = ['imgUrl', 'imageUrl', 'picUrl', 'image', 'iconUrl', 'backgroundUrl'];
            let modified = false;
            for (let key of imgKeys) {
                if (item[key]) {
                    item[key] = targetImage;
                    modified = true;
                }
            }
            // 暴力替换：如果没有找到标准key，尝试查找任何包含 http 的字符串值（慎用，此处仅作为兜底）
            if (!modified) {
                 for (let k in item) {
                     if (typeof item[k] === 'string' && item[k].startsWith('http')) {
                         // 简单判断是否像图片链接
                         if (item[k].includes('.jpg') || item[k].includes('.png') || item[k].includes('img')) {
                             item[k] = targetImage;
                         }
                     }
                 }
            }
            return item;
        };

        // 处理列表的辅助函数：只保留第一个并修改
        const processList = (list) => {
            if (Array.isArray(list) && list.length > 0) {
                log("Target list found, length: " + list.length);
                let firstItem = modifyItem(list[0]);
                return [firstItem];
            }
            return list;
        };

        // --- 策略 1: 常见路径直接命中 ---
        let handled = false;
        
        // 路径 A: data.bannerList / data.list
        if (obj.data) {
            if (obj.data.bannerList) {
                obj.data.bannerList = processList(obj.data.bannerList);
                handled = true;
            } else if (obj.data.list) {
                obj.data.list = processList(obj.data.list);
                handled = true;
            }
        }

        // --- 策略 2: 深度搜索 (针对 floors/cards 结构) ---
        // 很多 App 使用 data.floors 或 data.cardList，Banner 通常是第一个 floor 或 card
        if (!handled && obj.data) {
            const containers = ['floors', 'cardList', 'modules', 'blockList'];
            
            for (let containerName of containers) {
                if (obj.data[containerName] && Array.isArray(obj.data[containerName])) {
                    log("Checking container: " + containerName);
                    // 遍历这个容器，寻找这一层或者下一层的 banner
                    let container = obj.data[containerName];
                    
                    // 通常 Banner 在第一个位置
                    if (container.length > 0) {
                        let firstFloor = container[0];
                        
                        // 检查 firstFloor 是否直接包含数据列表 (例如 firstFloor.data.items)
                        if (firstFloor.data && firstFloor.data.items) {
                             firstFloor.data.items = processList(firstFloor.data.items);
                             handled = true;
                             log("Handled in " + containerName + "[0].data.items");
                        } 
                        // 或者 firstFloor 本身就是一个 item (例如 cardList[0])
                        else if (firstFloor.imgUrl || firstFloor.image || firstFloor.content) {
                             // 如果它本身就是个卡片，可能需要修改它的 content 字段
                             modifyItem(firstFloor);
                             // 如果是列表形式的卡片，保留这一个
                             obj.data[containerName] = [firstFloor];
                             handled = true;
                             log("Handled in " + containerName + " (Direct Item)");
                        }
                    }
                }
            }
        }

        if (!handled) {
            log("No known structure matched. Please share this log.");
        }

        $done({ body: JSON.stringify(obj) });

    } catch (e) {
        log("Error: " + e);
        $done({});
    }
} else {
    $done({});
}
