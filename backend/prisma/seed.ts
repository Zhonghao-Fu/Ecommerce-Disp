/**
 * 商品种子数据 - 用于开发测试
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 测试商品数据
const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'Apple 最新旗舰手机，搭载 A17 Pro 芯片，钛金属设计，48MP 摄像头系统',
    price: 999900, // ¥9999
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800',
      'https://images.unsplash.com/photo-1591337676887-a217a6c6e7d7?w=800',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'MacBook Pro 14"',
    description: '搭载 M3 Pro 芯片，18GB 统一内存，512GB SSD，Liquid Retina XDR 显示屏',
    price: 1699900, // ¥16999
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'AirPods Pro 2',
    description: '主动降噪，自适应音频，个性化空间音频，MagSafe 充电盒',
    price: 189900, // ¥1899
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'iPad Air',
    description: 'M2 芯片，11 英寸 Liquid Retina 显示屏，支持 Apple Pencil Pro',
    price: 479900, // ¥4799
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Apple Watch Series 9',
    description: 'S9 SiP 芯片，45mm 铝金属表壳，Always-On Retina 显示屏，血氧监测',
    price: 319900, // ¥3199
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800',
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sony WH-1000XM5',
    description: '旗舰降噪耳机，30 小时续航，Hi-Res 音频，多点连接',
    price: 249900, // ¥2499
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Dell XPS 15',
    description: 'Intel Core i7-13700H，RTX 4060，32GB RAM，1TB SSD，15.6" OLED',
    price: 1399900, // ¥13999
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Snapdragon 8 Gen 3，200MP 摄像头，S Pen，钛金属框架',
    price: 969900, // ¥9699
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
      'https://images.unsplash.com/photo-1585060544812-6cc4745e120e?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Nintendo Switch OLED',
    description: '7 英寸 OLED 屏幕，64GB 存储，增强音频，宽可调支架',
    price: 234900, // ¥2349
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Logitech MX Master 3S',
    description: '无线鼠标，8K DPI 传感器，静音点击，70 天续航，USB-C 快充',
    price: 69900, // ¥699
    status: 'on_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '机械革命 Code 01',
    description: 'AMD Ryzen 7 7840HS，RTX 4060，16GB RAM，1TB SSD，16" 2.5K 165Hz',
    price: 649900, // ¥6499
    status: 'off_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Razer BlackWidow V4',
    description: '机械键盘，绿轴，RGB 背光，磁吸腕托，多媒体滚轮',
    price: 129900, // ¥1299
    status: 'off_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800'
    ]),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: '旧款产品测试',
    description: '这是一个已下架的旧款产品，用于测试状态筛选功能',
    price: 99900, // ¥999
    status: 'off_sale',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a4e?w=800'
    ]),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-06-01')
  }
];

async function main() {
  console.log('🌱 开始插入种子数据...\n');

  try {
    // 清空现有数据
    console.log('🗑️  清空现有商品数据...');
    await prisma.product.deleteMany();
    console.log('✅ 现有数据已清空\n');

    // 插入新数据
    console.log('📦 正在插入商品数据...');
    const created = await prisma.product.createMany({
      data: products
    });

    console.log(`\n✅ 成功插入 ${created.count} 条商品数据\n`);

    // 显示插入的商品
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        status: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📊 商品列表:');
    console.log('─'.repeat(60));
    allProducts.forEach(product => {
      const priceYuan = (product.price / 100).toFixed(2);
      const statusMap: Record<string, string> = {
        'on_sale': '🟢 在售',
        'off_sale': '🔴 下架'
      };
      const status = statusMap[product.status] || product.status;
      console.log(`${status} ¥${priceYuan} | ${product.name}`);
    });
    console.log('─'.repeat(60));

    console.log('\n🎉 种子数据插入完成！');
    console.log('\n💡 提示:');
    console.log('  - 10 个在售商品');
    console.log('  - 3 个下架商品');
    console.log('  - 访问 http://localhost:3000/products 查看商品列表');

  } catch (error) {
    console.error('❌ 插入种子数据失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
