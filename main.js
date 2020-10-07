/************************
 * 自動作答 https://ethics-p.moe.edu.tw/exam/
 * 作者：EienYuki   https://github.com/EienYuki
 * 
 * 如何使用？
 * 有答案的 YEE.run_Auto(JSON)
 * 沒有的 YEE.run_Auto()
 ***********************/

(function(){
	window.YEE = {
		ans: [],
		data: [],
		getRandom (min,max) {
			return Math.floor(Math.random()*(max-min+1))+min
		},
		getJsno_Str_data () {
			return JSON.stringify(this.data)
		},
		getJsno_Str_ans () {
			return JSON.stringify(this.ans)
		},
	
		// 讀取剛剛的作答紀錄 在執行 analysis_Bpart 前一定要執行！！
		readData (jsno_str) {
			this.data = JSON.parse(jsno_str)
			this.uilog('OK readData')
		},
		// 讀取答案紀錄 在執行 analysis_Apart analysis_Bpart 前一定要執行！！  除非真的沒有答案。。。
		readAns (jsno_str) {
			this.ans = JSON.parse(jsno_str)
			this.uilog('OK readAns')
		},
		readAns_append (jsno_str) {
			for (const item of JSON.parse(jsno_str)) {
				let test = this.ans.filter((item2, index2, array2) => {
					return item2.title == item.title
				})
				if (test.length == 0) this.ans.push(item)
			}
			this.uilog('OK readAns_append')
		},
		// 作答 如果有答案會自動選正確的 沒有的話隨機
		answer (tg) {
			let all = (tg)? tg.find(".table.question > tbody > tr") : $(".table.question > tbody > tr")
			let count_O = 0, count_X = 0
			for (let i=0;i<all.length;i++) {
				let tmp = $(all[i])
				let title = tmp.find('p').text()
		
				let flag = true
				for (const x of this.ans) {
					if (x.title == title) {
						flag = false
						$(tmp.find('input')[Number(x.select)]).click()
						count_O += 1
					}
				}
				
				if (flag) {
					$(tmp.find('input')[this.getRandom(1,4)]).click()
					count_X += 1
				}
			}
			this.uilog(`OK answer 正確：${count_O}, 用猜的：${count_X}`)
		},
		// 作答完畢再送出前 一定要執行，請務必保存 這資料 analysis_Bpart 會用到
		analysis_Apart (tg) {
			let all = (tg)? tg.find(".table.question > tbody > tr") : $(".table.question > tbody > tr")
			let out = []
			for (let i=0;i<all.length;i++) {
				let tmp = $(all[i])
				let title = tmp.find('p').text()
				let select = tmp.find('input[type="hidden"]').val()
				out.push({title, select})
			}
			this.data = out
			this.uilog('OK analysis_Apart')
		},
		// 作答完畢再送出後 執行 他會比較你哪些題目是對的 在執行前請一定要執行 readData readAns，如果是第一次 那只需 readData
		analysis_Bpart (tg) {
			let all = (tg)? tg.find(".table.question > tbody > tr") : $(".table.question > tbody > tr")
			let 違い = []
			for (let i=0;i<all.length;i++) {
				let tmp = $(all[i])
				let title = $(tmp.find('p')[0]).text()
				違い.push(title)
			}
			this.data.filter( (item, index, array) => {
				let flag = true
				for (const x of 違い) {
					if(x == item.title) {
						flag = false
						break
					}
				}
				let test = this.ans.filter((item2, index2, array2) => {
					return item2.title == item.title
				})
				if (flag && test.length == 0) this.ans.push(item)
				return flag
			})
			this.uilog('OK analysis_Bpart')
		},
	
		run_Apart (ans_json_str) {
			if (ans_json_str) this.readAns(ans_json_str)
			this.answer()
			this.analysis_Apart()
			return this.getJsno_Str_data()
		},
		run_Bpart (data_json_str, ans_json_str) {
			if (ans_json_str) this.readAns(ans_json_str)
			if (data_json_str) this.readData(data_json_str)
			this.analysis_Bpart()
			return this.getJsno_Str_ans()
		},
	
		btn_auto_answer_ans_onclick () {
			alert('送出答案時畫面空白是正常現象')
			let ans_json_str = $("#auto_answer_ans").val()
			if (ans_json_str != "") this.readAns(ans_json_str)
			this.run_Auto()
		},
		uilog (str) {
			console.log("log", str)
			let log_box = $('#auto_answer_log')
			log_box.val(log_box.val() + `${str}\n` )
			log_box.scrollTop(log_box[0].scrollHeight)
		},
		initUI () {
			this.iframe = document.createElement('iframe')
			this.name = `run${new Date().getTime()}`
			this.iframe.id = this.name
			this.iframe.name = this.name
			this.iframe.style.width = "100vw"
			this.iframe.style.height = "90vh"
			this.iframe.src = 'https://ethics.moe.edu.tw/exam/'
	
			$("body").html('<div id="auto_answer" />')
			$("body > #auto_answer").load("https://myreq.asutora.com/ethics-p.moe.edu.tw_autoAnswer/UI.html")
			$("body").append(this.iframe)
		},
		run_Auto (ans_json) {
			this.iframe.src = 'https://ethics.moe.edu.tw/exam/'
	
			let my = this
			let box = {}
			
			this.uilog("開始 (延遲5秒)")
			if (ans_json) my.ans = ans_json
			this.uilog(`共有 ${my.ans.length} 筆答案`)
	
			setTimeout( () => {
				let f = document.getElementById(my.name)
				let doc = f.contentDocument
				box = $(doc)
	
				box.find('#btnStart').click()
				my.uilog("準備開始作答 (延遲5秒)")
			}, 5000)
	
			setTimeout( () => {
				let f = document.getElementById(my.name)
				let doc = f.contentDocument
				box = $(doc)
				
				my.answer(box)
				my.analysis_Apart(box)
				
				box.find("#btnSubmit").click()
				my.uilog("作答完成 (延遲5秒)")
			}, 10000)
	
			setTimeout( () => {
				let f = document.getElementById(my.name)
				let doc = f.contentDocument
				box = $(doc)
	
				my.analysis_Bpart(box)
	
				if ( confirm ("要在做一次?") )
				{
					$("#auto_answer_ans").val(my.getJsno_Str_ans())
					my.run_Auto()
				}
				else　{
					let jsno_str = my.getJsno_Str_ans()
					$("#auto_answer_ans").val(jsno_str)
					console.log("以下是答案")
					console.log(jsno_str)
					console.log("全部完成 答案請保存 (這是 JSON)")
				}
				
			}, 15000)
		}
	}
	
	window.YEE.initUI()
})()
