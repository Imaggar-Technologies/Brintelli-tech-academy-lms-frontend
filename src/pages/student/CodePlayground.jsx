import { useState } from "react";
import { Code2, Play, RotateCcw, BookOpen, Tag } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

const CodePlayground = () => {
  const [activeTab, setActiveTab] = useState("output");

  return (
    <>
      <PageHeader
        title="Code Playground"
        description="Practice coding interview problems with a lightweight editor, sample tests, and quick notes."
        actions={<Button variant="secondary">Browse library</Button>}
      />
      <div className="lg:flex lg:gap-6">
        <section className="flex min-h-[520px] flex-[0_0_46%] resize-x flex-col gap-5 overflow-y-auto rounded-3xl border border-brintelli-border bg-brintelli-card p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.35em] text-textMuted">Problem</p>
              <h2 className="text-2xl font-semibold text-text">Two Sum IV – Binary Search Tree</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-soft/20 px-4 py-1 text-xs font-semibold text-brand">
              <BookOpen className="h-3.5 w-3.5" /> Medium
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-textMuted">
            {["Binary Search Tree", "Hashing", "DFS"].map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brintelli-baseAlt px-3 py-1">
                <Tag className="h-3.5 w-3.5" />
                {tag}
              </span>
            ))}
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-textSoft">
            <p>
              Given the <span className="font-semibold text-text">root</span> of a Binary Search Tree and an integer <span className="font-semibold text-text">k</span>, return <em>true</em> if there exist two different nodes whose values add up to <span className="font-semibold text-text">k</span>.
            </p>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Example</p>
              <pre className="mt-3 whitespace-pre-wrap font-mono text-xs text-textSoft">
{`Input: root = [5,3,6,2,4,null,7], k = 9
Output: true

Input: root = [5,3,6,2,4,null,7], k = 28
Output: false`}
              </pre>
            </div>
            <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-textMuted">Constraints</p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>Tree nodes count is in the range [1, 10⁴]</li>
                <li>-10⁴ ≤ Node.val ≤ 10⁴</li>
                <li>Target value k is within [-10⁴, 10⁴]</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-6 flex min-h-[520px] flex-1 flex-col gap-5 rounded-3xl border border-brintelli-border bg-brintelli-card p-6 shadow-card lg:mt-0">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brintelli-border bg-brintelli-baseAlt/60 px-4 py-3">
            <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-textMuted">
              <Code2 className="h-4 w-4 text-brand" />
              Language
              <select className="rounded-full border border-transparent bg-white/70 px-3 py-1 text-sm font-medium text-text outline-none">
                {"C++ Java Python JavaScript".split(" ").map((lang) => (
                  <option key={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="gap-2 px-4" type="button">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
              <Button variant="secondary" className="gap-2 px-4" type="button">
                <Play className="h-4 w-4" /> Run Code
              </Button>
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-brintelli-border bg-[#0f172a]">
            <textarea
              className="h-full w-full resize-none rounded-2xl bg-transparent p-6 font-mono text-sm leading-6 text-white outline-none"
              defaultValue={`function findTarget(root, k) {
  const seen = new Set();
  const stack = [root];

  while (stack.length) {
    const node = stack.pop();
    if (!node) continue;

    if (seen.has(k - node.val)) {
      return true;
    }

    seen.add(node.val);
    stack.push(node.left, node.right);
  }

  return false;
}`}
            />
          </div>

          <div className="rounded-2xl border border-brintelli-border bg-brintelli-baseAlt">
            <div className="flex items-center gap-2 border-b border-brintelli-border px-4">
              {["input", "output"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    "py-3 text-xs font-semibold uppercase tracking-wide transition duration-160",
                    activeTab === tab ? "text-brand" : "text-textMuted",
                  ].join(" ")}
                >
                  {tab === "input" ? "Input" : "Output / Console"}
                </button>
              ))}
            </div>
            {activeTab === "input" ? (
              <textarea
                className="h-32 w-full resize-none rounded-b-2xl bg-white px-5 py-4 font-mono text-sm text-textSoft outline-none"
                defaultValue={`7
5 3 6 2 4 null 7
9`}
              />
            ) : (
              <div className="space-y-2 rounded-b-2xl bg-white px-5 py-4 font-mono text-sm text-textSoft">
                <p className="font-semibold text-brand">Status: Accepted</p>
                <p className="text-textMuted">Runtime: 48 ms · Beats 92% submissions</p>
                <p className="text-textMuted">Memory: 45 MB</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default CodePlayground;


