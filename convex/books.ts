import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { genre: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.genre) {
      return ctx.db.query("books").withIndex("by_genre", (q) => q.eq("genre", args.genre!)).order("desc").collect();
    }
    return ctx.db.query("books").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("books").first();
    if (existing) return;
    const samples = [
      {
        title: "Giấc Mơ Của Bầu Trời",
        description: "Câu chuyện về một cô gái tìm thấy ánh sáng giữa bóng tối, khi bầu trời bắt đầu mơ cùng cô.",
        genre: "fantasy",
        coverUrl: "https://picsum.photos/seed/zoe-sky/400/600",
        pages: [
          "Có một vùng đất nơi bầu trời không bao giờ tối hẳn. Ở đó, những ngôi sao nhảy múa trên nền trời tím biếc, và mặt trăng thì thầm kể chuyện cho gió nghe.\n\nLiên — cô gái nhỏ với mái tóc đen dài như dải lụa — luôn thức dậy trước bình minh. Cô ngồi trên mái nhà, nhìn lên bầu trời và tự hỏi: 'Liệu bầu trời có bao giờ mơ không?'",
          "Một đêm, khi cô đang ngồi trên mái nhà, một ngôi sao rơi xuống — nhưng thay vì vụt tắt, nó dừng lại trước mặt cô, nhấp nháy như đang nói chuyện.\n\n'Em là ai?' Liên hỏi.\n\nNgôi sao phát ra ánh sáng dịu dàng: 'Ta là giấc mơ cuối cùng của bầu trời. Ta cần em giúp ta trở về.'",
          "Liên nắm lấy ngôi sao nhỏ và bắt đầu hành trình xuyên qua những cánh rừng phát sáng, những dòng sông bạc lấp lánh. Mỗi bước chân, cô khám phá ra rằng thế giới đẹp hơn nhiều so với những gì cô từng nghĩ.\n\nVà khi cô đưa ngôi sao trở lại bầu trời — lần đầu tiên, cô thấy bầu trời mỉm cười."
        ],
        isFeatured: true,
      },
      {
        title: "Thư Gửi Ngày Mai",
        description: "Những lá thư gửi cho tương lai, về tình yêu, nỗi nhớ và hy vọng của tuổi trẻ.",
        genre: "romance",
        coverUrl: "https://picsum.photos/seed/zoe-letter/400/600",
        pages: [
          "Ngày 1 tháng 3,\n\nGửi ngày mai,\n\nHôm nay trời mưa. Mình ngồi trong quán cà phê nhỏ ở góc phố, nơi mà anh ấy từng ngồi đối diện mình, cười rất tươi và nói: 'Mưa rồi, uống gì ấm không?'\n\nĐã ba năm rồi. Mình vẫn gọi một ly cacao nóng, vẫn chọn bàn cạnh cửa sổ. Chỉ khác là ghế đối diện bây giờ trống.",
          "Ngày 15 tháng 5,\n\nGửi ngày mai,\n\nMình vừa đọc lại cuốn sách anh tặng — cuốn sách về những chuyến đi. Giữa trang 127, mình tìm thấy một tờ giấy nhỏ đã ố vàng. Nét chữ quen thuộc viết: 'Nếu một ngày em đọc được dòng này, hãy biết rằng anh luôn ở đây — trong từng trang sách em lật.'\n\nMình khóc. Nhưng lần này, nước mắt ấm hơn.",
          "Ngày 31 tháng 12,\n\nGửi ngày mai,\n\nMình quyết định viết lá thư cuối cùng. Không phải vì mình quên, mà vì mình đã sẵn sàng. Sẵn sàng để nhớ anh bằng nụ cười thay vì nước mắt.\n\nCảm ơn anh đã dạy mình rằng tình yêu không biến mất — nó chỉ đổi hình dạng.\n\nP.S: Quán cà phê đã mở thêm món bánh chocolate. Anh sẽ thích lắm đấy."
        ],
        isFeatured: true,
      },
      {
        title: "Căn Phòng Số 0",
        description: "Một bí ẩn rùng rợn về căn phòng không tồn tại trên bản đồ khách sạn, nhưng lại có ánh đèn mỗi đêm.",
        genre: "mystery",
        coverUrl: "https://picsum.photos/seed/zoe-room0/400/600",
        pages: [
          "Khách sạn Minh Nguyệt có 50 phòng, đánh số từ 101 đến 550. Không có phòng nào số 0. Ít nhất, đó là điều quản lý khách sạn nói với tôi khi tôi hỏi.\n\nNhưng mỗi đêm, từ hành lang tầng 1, tôi thấy ánh đèn lọt ra từ khe cửa cuối hành lang — nơi không có phòng nào trên bản đồ.",
          "Đêm thứ ba, tôi quyết định đi đến cuối hành lang. Bước chân tôi vọng lại trên nền gạch cũ. Đèn hành lang nhấp nháy. Và ở đó — một cánh cửa gỗ đã bong tróc, với số '0' được khắc thủ công.\n\nTôi gõ cửa. Không ai trả lời. Nhưng tay nắm cửa tự xoay.",
          "Bên trong, căn phòng trống hoàn toàn. Không giường, không bàn, không gì cả. Chỉ có một chiếc gương lớn treo trên tường.\n\nTôi nhìn vào gương — và thấy phản chiếu của mình. Nhưng trong gương, tôi đang mỉm cười. Còn ngoài gương, tôi biết chắc mình không hề cười.\n\nKhi tôi quay lưng bỏ đi, tôi nghe tiếng thì thầm: 'Đừng quên khóa cửa...'"
        ],
        isFeatured: false,
      },
      {
        title: "Mùa Hè Của Chúng Ta",
        description: "Câu chuyện thanh xuân về nhóm bạn thân cùng trải qua mùa hè cuối cùng trước khi tốt nghiệp.",
        genre: "slice_of_life",
        coverUrl: "https://picsum.photos/seed/zoe-summer/400/600",
        pages: [
          "Chúng tôi có bốn người: Minh — đứa lúc nào cũng cầm máy ảnh, Hoa — cô nàng 'chị đại' nhưng sợ côn trùng, Đức — thằng nhóc thích rap nhưng hát dở tệ, và tôi — người viết lại tất cả.\n\nMùa hè cuối cùng trước khi tốt nghiệp, chúng tôi quyết định làm một điều điên rồ: đạp xe xuyên ba tỉnh trong 7 ngày.",
          "Ngày thứ 3, xe Đức xịt lốp giữa đường. Chúng tôi ngồi bệt bên ruộng lúa, nắng chiều đổ vàng. Hoa mở lon nước ngọt cuối cùng, chia đều cho cả nhóm.\n\n'Sau này có ai nhớ ngày hôm nay không?' Minh hỏi, giơ máy ảnh lên.\n\n'Sẽ nhớ,' tôi nói. 'Vì tao sẽ viết về nó.'",
          "Ngày cuối cùng, chúng tôi đứng trên đồi nhìn hoàng hôn. Không ai nói gì. Minh chụp một bức ảnh — bốn bóng người in trên nền trời cam.\n\nBức ảnh đó bây giờ nằm trong ví tôi. Đã 10 năm. Chúng tôi ở bốn thành phố khác nhau. Nhưng mỗi mùa hè, tôi lại lấy bức ảnh ra, và nghe thấy tiếng cười năm ấy."
        ],
        isFeatured: false,
      },
      {
        title: "Bóng Đêm Thức Giấc",
        description: "Khi mặt trời lặn, những thứ không nên tồn tại bắt đầu thức dậy.",
        genre: "horror",
        coverUrl: "https://picsum.photos/seed/zoe-dark/400/600",
        pages: [
          "Quy tắc số 1: Đừng bao giờ nhìn ra ngoài cửa sổ sau 2 giờ sáng.\n\nĐó là điều bà ngoại dặn tôi khi tôi về quê nghỉ hè. Tôi cười, nghĩ bà mê tín. Cho đến đêm đầu tiên.",
          "2:17 sáng. Tôi thức giấc vì tiếng gõ cửa sổ. Nhẹ nhàng, đều đặn. Gõ... gõ... gõ...\n\nTôi nhớ lời bà. Tôi không nhìn. Tôi kéo chăn lên.\n\nNhưng rồi — tiếng gõ dừng lại. Và một giọng nói vang lên, ngay bên tai tôi: 'Mở mắt ra đi... bà đã ngủ rồi.'",
          "Sáng hôm sau, tôi hỏi bà về tiếng gõ. Bà im lặng hồi lâu, rồi nói: 'Chúng nó luôn ở ngoài đó. Đã bao đời nay. Chúng không vào được — trừ khi con mời.'\n\n'Mời bằng cách nào, bà?'\n\nBà nhìn tôi, mắt buồn: 'Bằng cách nhìn chúng. Khi con nhìn, con thừa nhận chúng tồn tại. Và khi chúng tồn tại... chúng có thể vào.'"
        ],
        isFeatured: false,
      },
    ];
    for (const book of samples) {
      await ctx.db.insert("books", { ...book, createdAt: Date.now() });
    }
  },
});
