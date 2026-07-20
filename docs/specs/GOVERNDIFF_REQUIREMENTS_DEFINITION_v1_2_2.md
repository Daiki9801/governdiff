# GovernDiff 要件定義書 v1.2.2

**公開製品名:** GovernDiff  
**正式表記:** GovernDiff — CI/CD for Business Policies  
**主要タグライン:** Test policy changes before they ship.  
**応募カテゴリー:** OpenAI Build Week — Work and Productivity  
**開発体制:** Solo entrant / individual developer  
**文書種別:** Lean Solo Submission 要件定義書  
**版:** 1.2.2  
**作成日:** 2026-07-18  
**状態:** Approved lean implementation baseline  
**置換対象:** `GOVERNDIFF_REQUIREMENTS_DEFINITION_v1_2_1.md`  
**公式提出期限:** 2026-07-21 5:00 PM PDT / 2026-07-22 09:00 JST  

---

# 0. 文書統制と最終方針

## 0.1 目的

本書は、OpenAI Build Weekへ個人で提出するGovernDiffについて、次の二点を同時に満たす最小実装範囲を定める。

1. Official Rules、公式FAQ、公式更新で要求される最低限の応募条件を欠落なく満たすこと
2. 残り時間内で完成度を上げ、審査基準上の強みを失わないこと

v1.2.1は安全性、評価、運用を広範に検討した設計資料として履歴保持する。v1.2.2は、**Build Week提出用の実装正本**である。

## 0.2 残り時間を前提とした判断

本版の凍結時点は2026-07-18 11:46 JSTであり、公式締切まで約93時間である。

したがって、P0は次のいずれかに該当する項目だけに限定する。

- 公式提出または適格性に必須
- Stage 1のpass/failに必須
- Stage 2の四審査基準へ直接寄与する
- GovernDiff固有のMagic Momentを成立させる
- 3分動画とREADMEで明確に証明できる

上記に該当しない品質活動、運用機能、将来機能はP1またはP2へ移す。

## 0.3 公式情報の規範順位

1. OpenAI Build Week Official Rules
2. OpenAI Build Week Hackathon Website / official updates
3. Official FAQ
4. OpenAI Build Week landing page / Resources
5. Plugin、Discussion、第三者解説

矛盾時はOfficial Rulesを優先する。

## 0.4 v1.2.1からの主要縮小

| 項目 | v1.2.1 | v1.2.2 |
|---|---|---|
| 外部user validation | P0 | **任意、提出を阻害しない** |
| Codex App Server埋込み | P0 | **P1。Codexは主要開発手段として公式要件を満たす** |
| Replay system | P0 | **削除。Credential-free Sample Modeへ置換** |
| Model-blind/private holdout | P0 | **内部参考。提出P0から除外** |
| Audit hash chain | P0 | **削除。簡易履歴表示のみ任意** |
| Evidence Bundle | P0 | **削除。READMEと画面上の根拠表示へ統合** |
| ACTION approval / simulated outbox | P0 | **削除。外部作用を製品範囲外と明記** |
| 6種類のrole simulation | P0 | **削除。単一ユーザー操作** |
| 複数project / DB / RBAC | 一部P0 | **削除。単一デモscenario、session内状態** |
| 任意CSV upload | P0 | **P1。P0は同梱48-row dataset** |
| Naming再調査一式 | P0 | **既実施の予備確認を採用。新たな衝突を知った場合のみ対応** |
| Claim / Asset register | 個別P0文書 | **READMEの短いDisclosureへ統合** |
| 対応環境 | 複数環境 | **Windows 11 + current Chromeを正式対象** |
| デモ反復 | Live/Replay各5回 | **最終フロー3回連続成功** |
| 公開fixture | 維持 | **維持。18→16、removed 3、added 1を正本値とする** |
| GPT-5.6規程解析 | P0 | **維持** |
| 固定runtimeとImpact Preview | P0 | **維持。差別化の中核** |
| Codex利用証拠 | P0 | **維持。primary thread + `/feedback` + README + video** |

## 0.5 変更禁止

本書承認後、次を除き新しいP0を追加しない。

- Official Rulesへの適合に必要な修正
- 実装中に判明した重大な動作不能の修正
- 既存P0を削減して完了確率を上げる変更

新しい業務scenario、認証、外部連携、マルチテナント、RAG、マルチエージェントは追加しない。

---

# 1. OpenAI Build Week最低必須要件の再調査結果

## 1.1 公式日程

| 項目 | 規範値 |
|---|---|
| Submission period | 2026-07-13 09:00 PDT〜2026-07-21 17:00 PDT |
| Submission deadline | **2026-07-21 17:00 PDT / 2026-07-22 09:00 JST** |
| Judging period | Official Rules上は2026-07-22〜2026-08-05 |
| Winner announcement | On or around 2026-08-12 |

公開動画、repository、test buildは最低でも公式Judging Period終了までアクセス可能にする。運用負担がほぼないため、公開状態は受賞発表予定日の2026-08-12まで維持する。

## 1.2 公式最低要件とGovernDiffの対応

| ID | 公式最低要件 | GovernDiff v1.2.2の対応 |
|---|---|---|
| BW-M01 | 対象trackへ適合するworking project | Work and Productivity、policy-driven back-office operations |
| BW-M02 | Codexを意味のある形で使用 | primary Codex threadでcore implementationの大部分を構築 |
| BW-M03 | GPT-5.6を意味のある形で使用 | 製品内で規程文をschema-constrained PolicySpec候補へ変換 |
| BW-M04 | 一つのcategoryを選択 | Work and Productivityのみ |
| BW-M05 | Project description | 英語の短文・詳細説明をDevpostへ記載 |
| BW-M06 | 3分未満のpublic YouTube video | 英語音声付き、working project、Codex、GPT-5.6を説明 |
| BW-M07 | Code repository URL | Public repository + relevant open-source licenseを原則とする |
| BW-M08 | README | setup、sample data、test path、Codex/GPT-5.6の寄与を記載 |
| BW-M09 | `/feedback` Codex Session ID | core機能の大部分を構築したprimary threadから取得 |
| BW-M10 | Judging/testing access | Local functioning test buildとsample scenarioを無償提供 |
| BW-M11 | 英語または英訳 | README、動画音声、Devpost、testing instructionsを英語化 |
| BW-M12 | IP・license適合 | 自作UI、合成data、許諾済みOSSのみ。動画に第三者音楽を使用しない |
| BW-M13 | Existing workの区分 | pre-existing codeがあればREADMEとcommit historyで明示 |
| BW-M14 | Videoと実物の整合 | 動画で見せる数値・機能をrepositoryで再現可能にする |

## 1.3 公式には必須でない事項

次はOfficial Rules、FAQ、公式update上の最低提出条件ではない。

- 外部user validation、顧客インタビュー、3名テスト
- Cloud deploymentまたは独自domain
- Codex App Serverを製品へ埋め込むこと
- Replay event system
- Model-blind holdoutまたはprivate challenge set
- 暗号学的audit chain
- Evidence Bundle download
- 本格的な認証、RBAC、職務分離
- 複数OS、複数browserの保証
- 商標専門家による正式意見
- 独立したClaim RegisterまたはAsset Register
- 複数業務scenario

これらがないことを理由に提出を停止しない。

## 1.4 審査基準と残すべき強み

Stage 1はtheme適合とrequired toolsの合理的利用をpass/failで確認する。Stage 2は次の四項目を均等評価する。

1. Technological Implementation
2. Design
3. Potential Impact
4. Quality of the Idea

GovernDiffは次を残すことで四軸へ対応する。

| 審査軸 | 残す証拠 |
|---|---|
| Technological Implementation | 実際のGPT-5.6 integration、typed PolicySpec、固定DSL runtime、deterministic Impact Engine、Codex primary build evidence、automated tests |
| Design | 3-stepの一貫した体験、曖昧性block、Impact Preview、Finding evidence |
| Potential Impact | Policy Ownerが規程変更を運用投入前に確認する具体的な業務課題 |
| Quality of the Idea | AIに規程を直接執行させず、変更差分と影響をtestable releaseとして見せる発想 |

---

# 2. プロダクト定義

## 2.1 一文定義

> **GovernDiff shows policy owners what a written policy change will do before they publish it.**

補助説明:

> GPT-5.6 structures the written policy, while a deterministic rules engine calculates the record-level impact and preserves human approval over the candidate release.

## 2.2 対象利用者

主対象は、中規模組織で文書と表計算を使い、規程に基づくレビューを行うOperations担当者である。

P0で実演する利用者は一人の**Policy Owner**とする。

## 2.3 解決する問題

規程の文章を変更しても、運用開始前に次を確認しにくい。

- 判定条件が具体的か
- 過去の案件へ適用すると何が変わるか
- 追加・削除されるreview対象は何か
- 既存版とcandidate版を混同していないか
- 各結果の根拠となる規程文と値は何か

## 2.4 差別化

GovernDiffは次ではない。

- 経費精算または支払サービス
- 不正検知システム
- 法令・税務適合判定
- 汎用RPA
- 自律的に業務操作を実行するagent
- 汎用policy-as-code platform

P0の価値は、**policy authoring + deterministic impact preview + versioned approval**である。

## 2.5 中核メッセージ

> **Compile with AI. Calculate impact deterministically. Publish deliberately.**

---

# 3. Lean P0スコープ

## 3.1 P0に残すもの

1. Mavrenna Field Systemsの一つの合成scenario
2. 同梱された48-row expense dataset
3. 編集可能な規程テキスト
4. GPT-5.6によるPolicySpec候補生成
5. 数量語・閾値の曖昧性検出
6. Human resolutionとspec確認
7. 制約付きDSLの固定runtime
8. v1のFinding計算
9. Findingごとの規程文・観測値・期待条件表示
10. Candidate v2の規程変更
11. v1/candidateのsemantic rule diff
12. 同一datasetを用いたImpact Preview
13. `removed 3 / added 1 / unchanged 15`の正確な表示
14. Candidateに新しいapprovalが必要であることの表示
15. CandidateのApprove and Publish
16. Published v1を履歴として保持するsession内表示
17. Live GPT Mode
18. Credential-free Sample Mode
19. Core unit tests
20. 英語README、3分未満動画、Devpost提出物、`/feedback` ID

## 3.2 P1 — P0完了後だけ着手可能

- 任意CSV upload
- Codex App Server、Codex SDKまたはCodex Execの製品内統合
- Cloud deployment
- Persisted project storage
- Findings CSV export
- 追加のvisual polish
- 一名以上への任意usability review

P1は2026-07-20 18:00 JSTまでにP0 E2Eが完成している場合だけ着手する。

## 3.3 P2 — 提出後

- 複数規程・複数企業
- Excel/PDF入力
- 認証、RBAC、職務分離
- 外部SaaS連携
- 通知、承認、支払等のoperational action
- RAG、法令library
- Audit hash chain
- Evidence Bundle
- マルチテナント
- 高度なpolicy DSL
- 大規模性能対応

## 3.4 明示的削除

P0には次のデータモデル・画面・処理を設けない。

- ActionIntent
- ACTION approval
- simulated outbox
- role switcher
- project list
- project deletion
- release revoke
- replay event timeline
- model-blind holdout runner
- private evaluation bundle
- cryptographic audit chain
- multi-hash Evidence Bundle export

---

# 4. 合成デモscenario

## 4.1 架空企業

**Mavrenna Field Systems**は完全な架空企業であり、実在組織との関係を示さない。

- Industry: B2B field-service operations software
- Employees: 480（合成設定）
- Operating regions: Americas / EMEA / Asia-Pacific
- Scenario: Finance Operationsがtravel and expense review policyを変更する
- Jurisdiction: none
- Legal compliance claim: false
- Production use: prohibited

UIとREADMEに次を表示する。

> Mavrenna Field Systems is a fictional demonstration company. All policies, employees, and expense records are synthetic.

## 4.2 Baseline v1

P0の規程は次を含む。

1. business purpose必須
2. department code必須
3. project code必須
4. USD 100.00以上でreceipt必須
5. lodgingがUSD 275.00超の場合manager review
6. SaturdayまたはSundayの支出はbusiness justification必須

最初のdraftではlodging ruleを次の曖昧文言にする。

> Unusually high lodging expenses require manager review.

GPT-5.6は`unusually high`を数値へ推測せず、clarificationを要求しなければならない。

## 4.3 Candidate v2

Candidateでは次を変更する。

```diff
- Expenses of USD 100.00 or more must include a receipt.
+ Expenses of USD 150.00 or more must include a receipt.

+ Rideshare expenses above USD 120.00 require manager review
+ unless a manager preapproved the expense.
```

## 4.4 正本dataset

- File: `MAVRENNA_EXPENSES_PUBLIC_DEMO.csv`
- Rows: 48
- Reports: 12
- Synthetic employees: 8
- Currency: USD only
- Email domain: `example.invalid`
- Dataset SHA-256: `452acc27170249d64d26722dfb48158f8231987dd48bac9331e00dbcd210da8a`

## 4.5 正本結果

| 指標 | v1 | Candidate v2 |
|---|---:|---:|
| Findings | 18 | 16 |
| Removed | — | 3 |
| Added | — | 1 |
| Unchanged | — | 15 |

Removedの代表:

- receipt finding at USD 105.00
- receipt finding at USD 129.50
- receipt finding at USD 149.99

Addedの代表:

- rideshare USD 145.00 without manager preapproval

この数値と異なる結果を動画またはREADMEで使用しない。

---

# 5. 中核ユーザーフロー

## 5.1 Step 1 — Analyze Policy

1. Built-in scenarioを開く
2. Draft v1 policyを表示する
3. `Analyze with GPT-5.6`を実行する
4. GPT-5.6がrules、ambiguities、unsupported statementsを返す
5. UIが`Unusually high`を明確なblocking ambiguityとして表示する

## 5.2 Step 2 — Resolve and Run Baseline

1. Policy OwnerがUSD 275.00へ修正する
2. 再解析する
3. 6 rulesを確認する
4. Baseline v1をsession内でapproveする
5. Fixed runtimeが48 rowsを処理する
6. 18 Findingsを表示する
7. Findingのevidence drawerを開く

## 5.3 Step 3 — Preview Change and Publish

1. Receipt thresholdを100から150へ変更する
2. Rideshare ruleを追加する
3. Candidateを再解析する
4. Fixed runtimeが同一datasetへv1とcandidateを実行する
5. Impact Previewを表示する
6. `3 removed / 1 added / 15 unchanged`を表示する
7. Candidateには新しいapprovalが必要と表示する
8. `Approve and Publish Candidate`を実行する
9. v1はv1の履歴として残し、candidateをv2として表示する

## 5.4 Magic Moment

動画の最初の30秒以内に次を表示する。

```text
Policy impact preview

3 prior review findings removed
1 new rideshare review added
15 findings unchanged
New approval required for candidate v2
Published v1 remains unchanged
```

---

# 6. UI要件

P0は一つの画面内の3-step workspace、または最大3画面とする。

## Screen / Step A — Policy

- Product nameとone-line value proposition
- Fictional company notice
- Policy editor
- Built-in dataset summary
- Live GPT / Sample Mode label
- Analyze button

## Screen / Step B — Review

- Extracted rules
- Ambiguities
- Unsupported statements
- Source sentence
- Resolve and approve baseline

## Screen / Step C — Impact

- v1/candidate policy diff
- Findings 18→16
- Removed 3 / Added 1 / Unchanged 15
- 具体的なaffected records
- Finding evidence drawer
- New candidate approval required
- Approve and Publish button

## UX原則

- JSON、hash、raw model responseを初期表示しない
- 色だけで状態を表現しない
- `finding`を法令違反または不正と表現しない
- 経費精算・支払を行う製品と誤解させない
- Live ModeとSample Modeを常時区別する
- Loaderまたはprogress stateを表示し、無反応に見せない

---

# 7. 機能要件

| ID | 要件 | 優先度 | 受入条件 |
|---|---|---:|---|
| FR-001 | Built-in Mavrenna scenarioを起動できる | P0 | policy、dataset summary、fiction noticeを表示する |
| FR-002 | Policy textを編集できる | P0 | v1とcandidateの文面を変更可能 |
| FR-003 | GPT-5.6へpolicy分析を要求できる | P0 | `gpt-5.6`を使用するAPI callがcode上に存在する |
| FR-004 | GPT outputをschema validationする | P0 | invalid JSONを成功扱いしない |
| FR-005 | Rules、ambiguities、unsupported statementsを区別する | P0 | UI上で別表示する |
| FR-006 | 曖昧な数量語を自動補完しない | P0 | `unusually high`でpublication readinessをblockする |
| FR-007 | Source sentenceをruleへ対応付ける | P0 | Finding evidenceから規程文を確認できる |
| FR-008 | 6つのbaseline rulesを表現できる | P0 | public expectationと一致する |
| FR-009 | Fixed runtimeでpublic datasetを評価する | P0 | v1 Finding 18件 |
| FR-010 | 各Findingへrule、record、observed value、expected conditionを付ける | P0 | evidence drawerで表示可能 |
| FR-011 | Candidate v2を作成できる | P0 | threshold変更とrideshare追加を表現する |
| FR-012 | Base/candidateを同一datasetで実行する | P0 | inputが同一であることを保証する |
| FR-013 | Impact Previewを決定論的に計算する | P0 | removed 3、added 1、unchanged 15 |
| FR-014 | Rule diffをmodified / addedで表示する | P0 | receiptはmodified、rideshareはadded |
| FR-015 | Candidateへ新しいapprovalが必要であることを表示する | P0 | v1 approvalをcandidateへ流用しない |
| FR-016 | Candidateをsession内でpublishできる | P0 | v1を残しv2をpublishedとして表示する |
| FR-017 | Live Modeを提供する | P0 | GPT-5.6を実際に呼ぶ |
| FR-018 | Sample Modeを提供する | P0 | API keyなしで同梱sample responseから主経路を確認可能 |
| FR-019 | Sample ModeをLiveと誤表示しない | P0 | persistent labelを表示する |
| FR-020 | External operational actionを行わない | P0 | email、payment、SaaS update、network actionを実装しない |

---

# 8. GPT-5.6統合要件

## 8.1 役割

GPT-5.6は次を行う。

- Policy textからPolicySpec候補を生成
- 明示的な条件をruleへ構造化
- 曖昧性を抽出
- P0非対応要求を抽出
- Source quote候補を返す

GPT-5.6は次を行わない。

- Expense recordのFinding判定
- Impact件数の計算
- 法令・税務解釈
- Approvalまたはpublish判断
- 外部業務操作

## 8.2 API契約

- Model ID: `gpt-5.6`
- API: Responses API
- Output: schema-constrained JSON
- Temperature相当の任意性よりschema adherenceを優先
- Policy textとfield schemaだけを送信する
- CSV全48行はモデルへ送らない
- API failure、timeout、refusal、schema failureを明示する

## 8.3 Sample Mode

Sample ModeはjudgesがAPI keyなしでUIとdeterministic runtimeを確認するために設ける。

- 事前保存したGPT responseを使用する
- `Sample Mode — precomputed policy analysis`を表示する
- RuntimeとImpact Previewはその場で実計算する
- Sample ModeをGPT-5.6 live callの証明として主張しない
- 動画ではLive Modeの成功runを使用する

---

# 9. Codex利用要件

## 9.1 公式要件を満たす方法

Codexを製品runtimeへ埋め込むことはP0要件ではない。公式FAQが認めるChatGPT Codex、CLI、IDE extension等を使い、projectの大部分を構築する。

Primary Codex threadでは最低限、次のcore implementationを扱う。

- PolicySpec schema
- Fixed condition evaluator
- Finding generation
- Impact diff engine
- Approval state
- Core UI flow
- Automated tests
- READMEのtechnical explanation

## 9.2 証拠

- Core workを一つのprimary threadへ可能な限り集約する
- Primary threadで`/feedback`を実行する
- Session IDを提出フォームへ入力する
- READMEにCodexが構築・修正した主要moduleと重要判断を書く
- Video音声でCodexの具体的利用を説明する
- Commit historyをSubmission Period内に残す

## 9.3 動画で説明する内容

例:

> I used Codex as my primary engineering partner to design the typed policy schema, implement the deterministic rules engine and impact diff, generate boundary tests, and review the end-to-end workflow. The submitted feedback Session ID comes from the primary thread where the majority of the core implementation was built.

## 9.4 P1 Stretch

P0、README、動画rough cutが完了した場合だけ、Codex Exec、SDKまたはApp Serverを用いたrelease artifact生成を追加してよい。

次の場合は追加しない。

- JSON-RPC bindingが必要
- judge setupが複雑になる
- 動画作成時間を圧迫する
- E2E安定性が下がる

---

# 10. Fixed Runtimeとデータ契約

## 10.1 最小PolicySpec契約

```ts
interface PolicySpec {
  policyId: string;
  version: string;
  rules: PolicyRule[];
  ambiguities: { id: string; sourceQuote: string; question: string }[];
  unsupportedStatements: { sourceQuote: string; reason: string }[];
}

interface PolicyRule {
  ruleId: string;
  condition: Condition;
  outcome: "clarification" | "manager_review";
  sourceQuote: string;
  message: string;
}
```

`sourceQuote`は規程本文のexact substringでなければならない。Hostが一致を確認できない場合、そのruleを承認可能状態にしない。

## 10.2 DSL範囲

```ts
type Operator =
  | "eq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "missing";

type Condition =
  | { kind: "predicate"; field: string; operator: Operator; value?: string | boolean }
  | { kind: "all"; conditions: Condition[] };
```

P0では`any`、regex、arbitrary expression、aggregation、external functionを実装しない。現在の6+1 rulesに必要な範囲だけを実装する。

## 10.3 制約

- Condition depth最大2
- 一ruleのleaf predicate最大3
- Unknown field/operatorはerror
- Moneyはdecimal stringをinteger centsへ変換して比較
- Binary floating pointによる金額比較は禁止
- Dateは`YYYY-MM-DD`
- Weekendはtrusted normalizerが`expense_date`から算出
- String/enum comparisonはexact case-sensitive
- Blank、empty、whitespace-onlyはmissing

## 10.4 Finding identity

```text
finding_key = policy_id + rule_id + expense_id
```

Impactは同じfinding keyを用いて比較する。

- baseだけ: removed
- candidateだけ: added
- 両方: unchanged

P0では`changed` classificationを必要としない。

## 10.5 Approvalの簡易契約

- Baseline approvalはbaseline versionへだけ有効
- Candidateは新しいapprovalを必要とする
- Candidate policy textまたはPolicySpecを編集した場合、candidate approvalを解除する
- Cryptographic multi-hash bindingはP1
- ApprovalはUI/session stateであり、enterprise authorizationではない

---

# 11. 実行環境と技術制約

## 11.1 正式対象

- OS: Windows 11
- Browser: current Google Chrome
- Runtime: pinned Node.js major
- Package manager: pinned pnpm major
- Language: TypeScript
- UI: React / Next.js
- Tests: Vitestまたは同等の既存test runner
- Storage: in-memoryまたはbrowser/session-local state

## 11.2 起動経路

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm dev
```

READMEにNode/pnpm versionとenvironment variablesを明記する。

## 11.3 Mode

- Live Mode: `OPENAI_API_KEY`が必要
- Sample Mode: key不要
- Cloud deployment: 不要
- Database: 不要
- Login: 不要
- Concurrent users: 非対応

## 11.4 Repository最小構造

```text
governdiff/
├── app/
├── lib/
│   ├── policy-spec.ts
│   ├── openai-policy-analyzer.ts
│   ├── policy-runtime.ts
│   ├── impact-engine.ts
│   └── demo-state.ts
├── demo/
│   ├── MAVRENNA_EXPENSES_PUBLIC_DEMO.csv
│   ├── policy-v1.md
│   ├── policy-v2.md
│   └── sample-policy-analysis.json
├── tests/
├── README.md
├── LICENSE
└── package.json
```

---

# 12. 非機能要件

| ID | 要件 | 目標 |
|---|---|---|
| NFR-001 | 48-row runtime | 1秒以内 |
| NFR-002 | Impact Preview | 2秒以内 |
| NFR-003 | GPT waiting UX | progress indicatorを表示 |
| NFR-004 | Demo consistency | 3回連続で同じ18→16結果 |
| NFR-005 | Failure honesty | GPT/API failureを成功表示しない |
| NFR-006 | Mode honesty | Live/Sampleを常時表示 |
| NFR-007 | Accessibility minimum | keyboard focus、labels、text status |
| NFR-008 | Data safety | 合成dataのみ、`example.invalid`のみ |
| NFR-009 | Scope honesty | production-ready、legal compliance、不正検知を主張しない |
| NFR-010 | Video consistency | 動画の機能とrepositoryの機能が一致 |

---

# 13. 最小テスト計画

## 13.1 必須automated tests

1. Decimal USDをinteger centsへ変換できる
2. `missing`がblank/whitespaceを検出する
3. Compound `all` ruleを評価できる
4. v1が18 Findingsを生成する
5. Candidateが16 Findingsを生成する
6. Impactがremoved 3 / added 1 / unchanged 15となる
7. Receipt thresholdの境界値149.99 / 150.00を正しく扱う
8. Rideshare 120.00 / 120.01とmanager preapprovalを正しく扱う
9. Candidate edit後にcandidate approvalが解除される
10. Sample ModeがLive labelを表示しない

## 13.2 Manual smoke test

- Fresh install
- `pnpm test`
- `pnpm dev`
- Sample Mode E2E
- Live GPT analysis 1回以上
- Videoで使用するfull flow 3回連続成功

## 13.3 削除した評価

次はP0では行わない。

- 12件以上のGPT extraction benchmark
- hidden holdout
- adversarial package import test
- 5,000-row performance test
- multi-OS CI
- independent user validation

---

# 14. 受入基準

| ID | 受入基準 |
|---|---|
| AC-001 | Work and Productivityとして一文で説明できる |
| AC-002 | ProjectがWindows 11/current Chromeで起動する |
| AC-003 | Codeで`gpt-5.6`を実際に使用する |
| AC-004 | `Unusually high`を数値へ自動補完せずambiguity表示する |
| AC-005 | 解決済みv1から6 rulesを表示する |
| AC-006 | v1のFindingが18件になる |
| AC-007 | CandidateのFindingが16件になる |
| AC-008 | Impactがremoved 3 / added 1 / unchanged 15になる |
| AC-009 | Receipt ruleをmodified、rideshare ruleをaddedとして表示する |
| AC-010 | Finding evidenceにpolicy sentence、record、observed value、conditionを表示する |
| AC-011 | Published v1をcandidate editで書き換えない |
| AC-012 | Candidateに新しいapprovalを要求する |
| AC-013 | Sample Modeをprecomputed analysisと明示する |
| AC-014 | External email、payment、SaaS updateを行わない |
| AC-015 | 必須10 automated testsがPassする |
| AC-016 | Full demo flowが3回連続成功する |
| AC-017 | READMEにsetup、sample、test、Codex、GPT-5.6、limitationsを記載する |
| AC-018 | Public YouTube videoが3分未満で音声を含む |
| AC-019 | Video音声でproduct、Codex利用、GPT-5.6 integrationを具体的に説明する |
| AC-020 | Public repositoryへlicenseを付ける、またはprivate repositoryを指定emailへ共有する |
| AC-021 | Primary Codex threadの`/feedback` Session IDを取得する |
| AC-022 | Submission textとtesting instructionsを英語で提供する |
| AC-023 | Third-party copyrighted musicを動画で使用しない |
| AC-024 | Deadline前にDevpost submissionを完了する |

---

# 15. 提出物要件

## 15.1 最低成果物

1. Working repository
2. Public YouTube video under 3 minutes
3. Devpost project description
4. Work and Productivity category
5. README
6. `/feedback` Session ID
7. Testing path
8. Relevant license

## 15.2 README最小構成

1. What GovernDiff does
2. Target user and problem
3. 60-second architecture overview
4. How GPT-5.6 is integrated
5. How Codex was used to build the core functionality
6. Setup
7. Live Mode
8. Sample Mode
9. Test command
10. Synthetic data notice
11. Known limitations
12. Pre-existing work / third-party disclosure

別のClaim Register、Asset Register、User Validation Reportは作成しない。

## 15.3 Devpost用短文

> **Work and Productivity — GovernDiff helps operations teams understand what a written policy change will do before they publish it. GPT-5.6 converts policy language into a reviewable rule specification, while a deterministic runtime compares the published and candidate versions against the same synthetic records and shows exactly which review findings are added or removed.**

## 15.4 Video要件

- 2:50以内を内部目標とする
- Public YouTube
- English audio
- No copyrighted background music
- First 30 secondsでMagic Momentを見せる
- Product、Codex、GPT-5.6を明示する
- Terminalやraw JSONを長時間見せない

### 推奨構成

| 時間 | 内容 |
|---|---|
| 0:00–0:12 | Problem and one-line value |
| 0:12–0:28 | Magic Moment: 3 removed / 1 added |
| 0:28–0:55 | GPT-5.6 detects `unusually high` ambiguity |
| 0:55–1:20 | Resolve threshold and show 6 rules |
| 1:20–1:45 | Baseline Findings and evidence |
| 1:45–2:10 | Candidate diff and deterministic Impact Preview |
| 2:10–2:28 | New candidate approval; v1 unchanged |
| 2:28–2:45 | Specific Codex and GPT-5.6 explanation |
| 2:45–2:55 | Closing |

---

# 16. 実装・提出スケジュール

## 16.1 Internal milestones

| Internal gate | 期限（JST） | 完了条件 |
|---|---|---|
| Gate A — Runtime | 2026-07-19 18:00 | v1 18、candidate 16、impact 3/1/15、tests Pass |
| Gate B — Product E2E | 2026-07-20 18:00 | GPT live analysis、Sample Mode、3-step UIが動作 |
| Gate C — Feature freeze | 2026-07-21 09:00 | 新規機能停止、bug/polishだけ |
| Gate D — Submission assets | 2026-07-21 18:00 | README、video rough cut、Devpost draft、Session ID |
| Gate E — Internal submission | **2026-07-21 23:00** | Devpost final submit。公式締切の10時間前 |
| Official deadline | 2026-07-22 09:00 | 変更不可 |

## 16.2 Stop rules

- Gate A未達なら任意policy supportを削り、Mavrenna固定rulesへ集中する
- Gate B未達ならcloud deploy、App Server、CSV uploadを完全に断念する
- Live GPTが不安定でもintegration codeを残し、Sample Modeをjudge test pathとする
- Video作成開始後はUI layout変更を行わない
- 2026-07-21 09:00以降、新dependencyを追加しない
- Devpost submissionを動画upload完了まで待たず、早期にdraft作成する

---

# 17. 主要リスクと対策

| ID | リスク | 対策 |
|---|---|---|
| RISK-001 | Scopeが再拡大する | 本書以外のP0追加を禁止 |
| RISK-002 | GPT出力が不安定 | schema validation、人間確認、Sample Mode |
| RISK-003 | Codex利用が薄く見える | primary threadへcore implementationを集約し、README/videoで具体化 |
| RISK-004 | 経費checkerに見える | policy change Impact Previewを最初に見せる |
| RISK-005 | Developer Toolに見える | Policy Ownerの業務画面と問題を主語にする |
| RISK-006 | App Server統合で時間を失う | P1へ降格。Official requirementではない |
| RISK-007 | Judgeがbuildしない | Video、screenshots、READMEだけでも理解できる構成 |
| RISK-008 | JudgeがAPI keyを持たない | Credential-free Sample Mode |
| RISK-009 | Video/Devpostが締切に間に合わない | 10時間のinternal buffer、早期draft |
| RISK-010 | IP/asset問題 | 自作UI、合成data、無音または自作音声、OSS licenseだけ確認 |
| RISK-011 | 公式要件を満たさない | Section 1とAC-017〜024のsubmission gate |
| RISK-012 | 数値が動画と実装でずれる | 18→16、3/1/15をsingle fixtureから生成 |

---

# 18. 審査基準トレーサビリティ

| Judging criterion | P0 evidence | 動画で見せるもの |
|---|---|---|
| Technological Implementation | GPT-5.6 schema output、typed DSL、deterministic runtime、impact tests、Codex build thread | GPT ambiguity、runtime counts、Codexの具体的開発寄与 |
| Design | 3-step coherent flow、evidence drawer、clear mode labels | 迷わない一連の操作、business-facing Impact screen |
| Potential Impact | Policy Ownerとoperations policy releaseの具体的pain | 公開前に3 removed / 1 addedを把握できる価値 |
| Quality of the Idea | AI authoringとdeterministic impactを分離 | 「AIに執行させず、変更をreleaseとしてtestする」発想 |

---

# 19. Definition of Done

GovernDiff v1.2.2は次をすべて満たした場合に提出可能とする。

## Product

- [ ] GPT-5.6 Live Modeが少なくとも一回成功する
- [ ] Sample ModeでAPI keyなしに主経路を確認できる
- [ ] Ambiguity Gateが動く
- [ ] v1 18 Findings
- [ ] Candidate 16 Findings
- [ ] Impact removed 3 / added 1 / unchanged 15
- [ ] Finding evidenceを表示する
- [ ] Candidate approvalとv1 preservationを表示する
- [ ] 外部業務作用を行わない
- [ ] 必須testがPassする
- [ ] Full flowを3回連続完走する

## Codex / GPT evidence

- [ ] Core workの大部分をprimary Codex threadで行う
- [ ] `/feedback` Session IDを取得する
- [ ] READMEにCodexの具体的寄与を書く
- [ ] READMEにGPT-5.6 integrationを書く
- [ ] Video音声でCodexとGPT-5.6を説明する

## Submission

- [ ] Work and Productivityを選択する
- [ ] English project descriptionを入力する
- [ ] Public YouTube videoが3分未満
- [ ] Videoに音声がある
- [ ] Repository URLを提出する
- [ ] Public repoならlicenseを付ける
- [ ] READMEにsetup、sample、test pathがある
- [ ] Testing pathが無料で利用可能
- [ ] Synthetic/no-affiliation noticeがある
- [ ] Third-party workとpre-existing workを必要に応じて開示する
- [ ] 2026-07-21 23:00 JSTまでの内部提出を目標にする

## 提出を止めない任意事項

次が未実施でも提出する。

- User validation
- App Server integration
- Cloud deployment
- Arbitrary CSV upload
- Hidden holdout
- Replay system
- Audit chain
- Evidence Bundle
- Formal trademark opinion
- Multiple browser/OS verification

---

# 20. 参考公式情報

本書の公式要件は、2026-07-18時点で次を再確認して作成した。

1. OpenAI Build Week Official Rules  
   `https://openai.devpost.com/rules`
2. OpenAI Build Week FAQ  
   `https://openai.devpost.com/details/faqs`
3. OpenAI Build Week Resources  
   `https://openai.devpost.com/resources`
4. OpenAI Build Week official update — Submissions are open  
   `https://openai.devpost.com/updates/45282-openai-build-week-submissions-are-open-plugin-launch`
5. OpenAI Build Week landing page  
   `https://openai.com/build-week/`
6. OpenAI API Models — GPT-5.6  
   `https://developers.openai.com/api/docs/models`
7. Unlocking the Codex harness: how we built the App Server  
   `https://openai.com/index/unlocking-the-codex-harness/`

Official Rulesとその他ページに日程等の差異がある場合、Official Rulesを優先する。

---

# 21. 最終承認

v1.2.2をGovernDiffの**Lean Solo Submission実装正本**として採用する。

今後の優先順位は次の順とする。

1. Fixed runtimeとImpact Preview
2. GPT-5.6 Live integration
3. Coherent 3-step UI
4. Automated tests
5. Primary Codex threadと`/feedback` evidence
6. Video、README、Devpost submission
7. P1 stretch

残された時間では、機能数ではなく、**動作、説明、提出完了**を最優先する。
