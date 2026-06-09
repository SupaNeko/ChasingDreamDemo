<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: 巡梦
description: 温柔安全的梦境拼合与回看产品界面
---

# Design System: 巡梦

## 1. Overview

**Creative North Star: "低光梦舱"**

《巡梦》的界面是一间夜里可进入的低光梦舱：柔软、私密、安静，但不是昏暗到难以阅读。用户刚醒来时不需要被引导、教育或推销，只需要一个稳定的输入位置、一段被温柔整理的故事，以及可以慢慢漂浮在周围的梦境线索。

系统默认采用安静沉浸型产品 UI。它保留产品工具的清晰结构：顶部状态、中央故事、底部输入、侧向碎片匣、日历回看。但视觉气质必须柔和安全，避免 AI SaaS、心理咨询和玄学占卜的常见套路。

**Key Characteristics:**

- 低亮度、温和对比、长时间阅读不刺眼。
- 主故事区域稳定，氛围层缓慢流动。
- 动效服务于梦境感和状态反馈，不做装饰性炫技。
- 所有控件熟悉、克制、可信，不发明奇怪交互。

## 2. Colors

色彩策略是低光克制加少量温暖锚点：深色中性承载夜间安全感，低饱和暖光用于主要行动和保存反馈，情绪色只在关键词与详情氛围中少量出现。

### Primary

- **低光暖烛** ([to be resolved during implementation]): 用于主行动、保存成功、当前选中状态。它应像远处的暖灯，不像霓虹按钮。

### Secondary

- **梦面蓝雾** ([to be resolved during implementation]): 用于背景氛围、气泡边缘和详情页层次。它应偏灰、偏柔，不可变成科技蓝。

### Tertiary

- **潮湿玫影** ([to be resolved during implementation]): 用于少量情绪强调，尤其是“不舍、温柔、模糊”的梦境标签。

### Neutral

- **深夜纸面** ([to be resolved during implementation]): 主背景，不用纯黑。
- **雾灰墨字** ([to be resolved during implementation]): 正文与标题，不用纯白。
- **静默边界** ([to be resolved during implementation]): 分隔线、输入框边框和容器轮廓。

### Named Rules

**The Low-Lamp Rule.** 主操作颜色永远少量使用。一个视口里只允许一个最亮行动点。

**The No-Neon Rule.** 禁止使用高饱和霓虹蓝、霓虹紫、荧光粉作为大面积背景或按钮。

## 3. Typography

**Display Font:** [font pairing to be chosen at implementation]  
**Body Font:** [font pairing to be chosen at implementation]  
**Label/Mono Font:** [font pairing to be chosen at implementation]

**Character:** 字体方向应是人文、安静、可阅读。标题可以略有文学气，但 UI 标签、按钮、输入和日期必须使用清晰的产品字体。

### Hierarchy

- **Display** ([to be resolved], [to be resolved], [to be resolved]): 只用于启动页标题或详情页梦境标题。
- **Headline** ([to be resolved], [to be resolved], [to be resolved]): 用于页面主标题和关键状态。
- **Title** ([to be resolved], [to be resolved], [to be resolved]): 用于面板、日历日期组和碎片匣标题。
- **Body** ([to be resolved], [to be resolved], [to be resolved]): 用于梦境故事，最大行长控制在 65-75ch。
- **Label** ([to be resolved], [to be resolved], [to be resolved]): 用于按钮、时间、输入提示和状态标签。

### Named Rules

**The Whispered Text Rule.** 正文字号和行距必须让用户在低光环境下能慢慢读完一段梦，不允许小字堆叠或高密度压缩。

## 4. Elevation

系统以色调层次和柔和边界表达深度，而不是重阴影。容器默认贴在同一低光空间里，只有碎片匣、底部输入栏和悬浮气泡需要轻微抬起。阴影必须大而散，绝不能像后台管理系统的卡片阴影。

### Named Rules

**The Mist-Layer Rule.** 深度来自雾化层次，不来自硬阴影。若阴影边缘清楚到能看见盒子轮廓，就太重了。

## 5. Components

### Buttons

- **Shape:** 稳定轻圆角，建议从 8px 开始。
- **Primary:** 用低光暖烛承载唯一主行动，比如发送、保存、进入梦境。
- **Hover / Focus:** 使用轻微亮度变化、细焦点环和短过渡。禁止发光泛滥。
- **Secondary / Ghost:** 用于返回、切换梦者、打开碎片匣。默认低对比，聚焦时清晰。

### Chips

- **Style:** 关键词气泡是签名组件。它们可漂浮，但文本必须清晰，不能覆盖主故事。
- **State:** 类型可以通过低饱和色、轻边框和小图标区分，但颜色不是唯一提示。

### Cards / Containers

- **Corner Style:** 轻圆角，通常 8px。
- **Background:** 使用深夜纸面上更浅或更深的雾化层。
- **Shadow Strategy:** 默认不用硬阴影。
- **Border:** 使用静默边界，透明度低但可见。
- **Internal Padding:** 输入区紧凑，故事区舒展。

### Inputs / Fields

- **Style:** 底部输入框是稳定锚点，背景略亮于页面，边框柔和。
- **Focus:** 焦点环必须明显但不刺眼。
- **Error / Disabled:** 错误用低饱和暖红并配文案说明，不只变色。

### Navigation

顶部导航轻量存在：当前梦者、日历、保存、切换梦者。不要做完整 SaaS 顶栏，也不要做营销导航。

### Signature Component: 梦境拼合舱

中央故事、漂浮关键词、底部输入、碎片匣共同构成梦境拼合舱。它是一个工作界面，不是 hero section。背景可以缓慢呼吸，关键词可以漂浮，但输入和故事必须保持稳定。

## 6. Do's and Don'ts

### Do:

- **Do** 让主故事区域拥有最高阅读清晰度。
- **Do** 使用低亮度、有色中性，而不是纯黑纯白。
- **Do** 让沉浸动效集中在背景、气泡和状态反馈上。
- **Do** 为 `prefers-reduced-motion` 提供降级。
- **Do** 让日历、详情、保存状态和错误反馈保持产品工具的可靠性。

### Don't:

- **Don't** 像 AI SaaS 工具：禁止大面积渐变、发光按钮、营销式卡片、英雄区指标模板。
- **Don't** 像心理咨询产品：禁止医疗感、诊断感、过度疗愈文案和白绿诊室式配色。
- **Don't** 像玄学占卜产品：禁止星盘、水晶、神秘符号堆叠、塔罗式视觉和故作玄虚的图腾。
- **Don't** 使用渐变文字、装饰性玻璃拟态、重复卡片网格或彩色侧边条。
- **Don't** 让气泡、动效或背景抢走输入和故事的优先级。
