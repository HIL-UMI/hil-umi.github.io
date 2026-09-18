import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const arxivUrl = 'https://arxiv.org/abs/2609.20659';

const bibtex = `@article{han2026hilumi,
  title={HIL-UMI: Bringing Human-in-the-Loop Post-Training of Vision-Language-Action Models to Universal Manipulation Interface},
  author={Han, Zimu and Zeng, Yiming and Zhang, Jiyao and Zhao, Zihao and Wang, Yuanfei and Jin, Yixiang and Li, Shiqi and Chen, Shuangben and Huang, Wei and Li, Ruodai and Shen, Hui and Dong, Hao},
  journal={arXiv preprint arXiv:2609.20659},
  year={2026},
  eprint={2609.20659},
  archivePrefix={arXiv},
  primaryClass={cs.RO}
}`;

const authors = [
  ['Zimu Han', '*1,4'],
  ['Yiming Zeng', '*1,4'],
  ['Jiyao Zhang', '*‡1,2,3'],
  ['Zihao Zhao', '1'],
  ['Yuanfei Wang', '1,2,3'],
  ['Yixiang Jin', '5'],
  ['Shiqi Li', '5'],
  ['Shuangben Chen', '1'],
  ['Wei Huang', '1'],
  ['Ruodai Li', '5'],
  ['Hui Shen', '5'],
  ['Hao Dong', '†1,2,3'],
];

const navItems = [
  ['abstract', 'Abstract'],
  ['method', 'Method'],
  ['hardware', 'Hardware'],
  ['demos', 'Demos'],
  ['results', 'Results'],
  ['citation', 'Cite'],
];

const contributions = [
  {
    index: '01',
    title: 'Robot-free iteration',
    text: 'A portable UMI turns human demonstrations into policy-aware post-training data without executing the policy on a physical robot.',
    tag: 'Scalable collection',
  },
  {
    index: '02',
    title: 'Policy-guided OOD detection',
    text: 'A distribution-aware Energy Score compares human actions with stochastic policy trajectories and retains the states where the policy is weak.',
    tag: 'Targeted supervision',
  },
  {
    index: '03',
    title: 'Advantage-aware learning',
    text: 'An iteratively refined advantage estimator prioritizes task-progressing behaviors through advantage-weighted behavioral cloning.',
    tag: 'Utility-aware updates',
  },
];

const methodSteps = [
  {
    number: '01',
    label: 'COLLECT',
    title: 'Detect policy blind spots',
    text: 'While an operator demonstrates with UMI, the current policy samples 10 action trajectories from the same observation stream. High human-policy discrepancy triggers collection.',
  },
  {
    number: '02',
    label: 'REFINE',
    title: 'Improve the advantage model',
    text: 'Low online advantage predictions identify hard temporal segments. These examples refine the progress-based advantage estimator in every post-training round.',
  },
  {
    number: '03',
    label: 'UPDATE',
    title: 'Train with data utility',
    text: 'Base demonstrations and newly collected policy-specific data are balanced, labeled by advantage, and used for continued AWBC policy training.',
  },
];

const tasks = [
  {
    name: 'Fold Towel',
    kind: 'Long-horizon · Deformable',
    videos: [
      { label: 'SFT', src: '/videos/fold-towel-sft.mp4', poster: '/assets/video-posters/fold-towel-sft.webp' },
      { label: 'HIL-UMI', src: '/videos/fold-towel-hil-umi.mp4', poster: '/assets/video-posters/fold-towel-hil-umi.webp' },
    ],
    text: 'Flatten a randomly initialized towel, complete two folds while removing wrinkles, and place it in a basket.',
  },
  {
    name: 'Clean Up Table',
    kind: 'Long-horizon · Housework',
    videos: [
      { label: 'SFT', src: '/videos/clean-up-table-sft.mp4', poster: '/assets/video-posters/clean-up-table-sft.webp' },
      { label: 'HIL-UMI', src: '/videos/clean-up-table-hil-umi.mp4', poster: '/assets/video-posters/clean-up-table-hil-umi.webp' },
    ],
    text: 'Sort three pens into color-matched slots, store three toys, and correctly operate two drawers.',
  },
  {
    name: 'Stack Cube',
    kind: 'Precision · Spatial',
    videos: [
      { label: 'SFT', src: '/videos/stack-cube-sft.mp4', poster: '/assets/video-posters/stack-cube-sft.webp' },
      { label: 'HIL-UMI', src: '/videos/stack-cube-hil-umi.mp4', poster: '/assets/video-posters/stack-cube-hil-umi.webp' },
    ],
    text: 'Grasp a purple cube and place it precisely on top of a red target cube under varied initial layouts.',
  },
  {
    name: 'Stamp',
    kind: 'Precision · Alignment',
    videos: [
      { label: 'SFT', src: '/videos/stamp-sft.mp4', poster: '/assets/video-posters/stamp-sft.webp' },
      { label: 'HIL-UMI', src: '/videos/stamp-hil-umi.mp4', poster: '/assets/video-posters/stamp-hil-umi.webp' },
    ],
    text: 'Grasp and orient a stamp, then place it fully inside a tightly constrained marked target box.',
  },
];

const hardware = [
  ['01', 'Meta Quest 3 Controller', 'Real-time 6-DoF handheld pose tracking'],
  ['02', 'Intel RealSense D405', 'Close-range wrist-view observations'],
  ['03', 'Custom Connector', 'Rigid controller-to-gripper coupling'],
  ['04', 'AgiBot OmniPicker', 'Robot-compatible handheld gripper'],
  ['05', 'Meta Quest 3 Headset', 'Reference tracking and operator setup'],
  ['06', 'Intel RealSense D455', 'Fixed third-person visual context'],
];

function SiteNav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  return (
    <nav className={`topbar ${open ? 'menu-open' : ''}`} aria-label="Primary navigation">
      <a className="brand" href="#top" aria-label="HIL-UMI home" onClick={() => setOpen(false)}>
        <span className="brand-mark" aria-hidden="true" />
        HIL-UMI
      </a>
      <div className="nav-links" aria-label="Page sections">
        {navItems.map(([id, label]) => (
          <a href={`#${id}`} key={id} className={active === id ? 'active' : ''} aria-current={active === id ? 'location' : undefined} onClick={() => setOpen(false)}>{label}</a>
        ))}
      </div>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
        <span /><span />
      </button>
      <div className="mobile-nav" id="mobile-navigation">
        {navItems.map(([id, label]) => <a href={`#${id}`} key={id} onClick={() => setOpen(false)}>{label}</a>)}
      </div>
    </nav>
  );
}

function SectionHeading({ kicker, title, description, light = false }: { kicker: string; title: string; description?: string; light?: boolean }) {
  return (
    <header className={`section-heading ${light ? 'light' : ''} reveal`}>
      <p className="section-kicker"><span />{kicker}</p>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  );
}

type ComparisonVideo = {
  label: string;
  src: string;
  poster: string;
};

function VideoComparison({ taskName, videos }: { taskName: string; videos: ComparisonVideo[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const endedVideos = useRef(new Set<number>());
  const isInView = useRef(false);
  const [isPaused, setIsPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const isPausedRef = useRef(isPaused);
  const [errors, setErrors] = useState<Record<number, boolean>>({});

  const playVideos = () => {
    videoRefs.current.forEach((video) => {
      if (video && !video.ended) void video.play().catch(() => undefined);
    });
  };

  const pauseVideos = () => {
    videoRefs.current.forEach((video) => video?.pause());
  };

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !('IntersectionObserver' in window)) {
      isInView.current = true;
      if (!isPausedRef.current) playVideos();
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      isInView.current = entry.isIntersecting;
      if (entry.isIntersecting && !isPausedRef.current) playVideos();
      else pauseVideos();
    }, { threshold: 0.3 });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    isPausedRef.current = nextPaused;
    if (nextPaused) pauseVideos();
    else playVideos();
  };

  const handleEnded = (index: number) => {
    endedVideos.current.add(index);
    if (endedVideos.current.size !== videos.length) return;

    videoRefs.current.forEach((video) => {
      if (video) video.currentTime = 0;
    });
    endedVideos.current.clear();
    if (isInView.current && !isPausedRef.current) playVideos();
  };

  const handleError = (index: number) => {
    setErrors((current) => ({ ...current, [index]: true }));
    handleEnded(index);
  };

  return (
    <div className="task-visual" ref={containerRef}>
      <div className="comparison-video-grid">
        {videos.map((video, index) => (
          <div className="comparison-video" key={video.label}>
            <video
              ref={(element) => { videoRefs.current[index] = element; }}
              src={assetUrl(video.src)}
              poster={assetUrl(video.poster)}
              muted
              playsInline
              preload="metadata"
              aria-label={`${taskName} — ${video.label} result`}
              onEnded={() => handleEnded(index)}
              onError={() => handleError(index)}
            />
            <span className={`video-method-label ${video.label === 'HIL-UMI' ? 'video-method-label-primary' : ''}`}>{video.label}</span>
            {errors[index] && <span className="video-error" role="status">Video unavailable</span>}
          </div>
        ))}
      </div>
      <button className="comparison-playback" type="button" onClick={togglePlayback} aria-label={`${isPaused ? 'Play' : 'Pause'} ${taskName} comparison videos`}>
        <span aria-hidden="true">{isPaused ? '▶' : 'Ⅱ'}</span>
        {isPaused ? 'Play comparison' : 'Pause comparison'}
      </button>
    </div>
  );
}

function App() {
  const [active, setActive] = useState('abstract');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const copyBibtex = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(bibtex);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = bibtex;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        const copied = document.execCommand('copy');
        textArea.remove();
        if (!copied) throw new Error('Copy command failed');
      }
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
    window.setTimeout(() => setCopyStatus('idle'), 2200);
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((item) => revealObserver.observe(item));
    return () => revealObserver.disconnect();
  }, []);

  useEffect(() => {
    const sections = navItems.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-22% 0px -60% 0px', threshold: [0, 0.2, 0.5] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <SiteNav active={active} />

      <section className="hero" id="top">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-inner">
          <p className="eyebrow"><span /> HUMAN-IN-THE-LOOP ROBOT LEARNING</p>
          <h1><span>HIL-UMI</span></h1>
          <h2>Bringing Human-in-the-Loop Post-Training of Vision-Language-Action Models to Universal Manipulation Interface</h2>

          <div className="authors" aria-label="Authors">
            {authors.map(([name, affiliation]) => <span className="author" key={name}>{name}<sup>{affiliation}</sup></span>)}
          </div>
          <div className="affiliations">
            <div className="affiliation-row">
              <span><sup>1</sup> Center on Frontier Computing Studies, School of Computer Science, Peking University</span>
            </div>
            <div className="affiliation-row">
              <span><sup>2</sup> National Key Laboratory for Multimedia Information Processing, School of Computer Science, Peking University</span>
            </div>
            <div className="affiliation-row affiliation-row-compact">
              <span><sup>3</sup> PrimeBot</span>
              <span><sup>4</sup> Xi&apos;an Jiaotong University</span>
              <span><sup>5</sup> JD Technology</span>
            </div>
          </div>
          <div className="equal-note" aria-label="Author notes">
            <span><sup>*</sup> Equal contribution.</span>
            <span><sup>‡</sup> Project lead.</span>
            <span><sup>†</sup> Corresponding author. Correspondence to <a href="mailto:hao.dong@pku.edu.cn">hao.dong@pku.edu.cn</a>.</span>
          </div>

          <div className="hero-actions" aria-label="Project links">
            <a className="button button-primary" href={arxivUrl} target="_blank" rel="noreferrer">Paper <small>arXiv</small></a>
            <span className="button button-secondary" aria-disabled="true">Code <small>Coming soon</small></span>
          </div>

          <figure className="hero-figure">
            <img src={assetUrl('/assets/teaser.webp')} alt="HIL-UMI replaces inefficient real-robot intervention with policy-guided robot-free collection and reaches near-perfect task progress" />
          </figure>

          <div className="hero-stat-row" aria-label="Research highlights">
            <div><strong>5.63×</strong><span>faster collection<br />than HG-DAgger</span></div>
            <div><strong>≈100</strong><span>final task<br />progress score</span></div>
            <div><strong>4</strong><span>real-world<br />manipulation tasks</span></div>
          </div>
        </div>
      </section>

      <section className="section abstract-section" id="abstract">
        <div className="container">
          <SectionHeading kicker="ABSTRACT" title="Policy-aware post-training, without the robot." description="HIL-UMI preserves the iterative feedback of human-in-the-loop learning while moving data collection to a portable handheld interface." />
          <div className="abstract-layout">
            <div className="abstract-copy reveal">
              <p className="lead">Large-scale vision-language-action models offer powerful manipulation priors, but reliable deployment still demands task-specific adaptation. Static demonstrations miss the out-of-distribution states reached by a learned policy, while standard imitation treats every example as equally useful.</p>
              <p>HIL-UMI addresses both limits through a policy-guided Universal Manipulation Interface. During handheld demonstrations, the current policy predicts actions from the same observation stream without controlling a physical robot. A distribution-aware Energy Score detects policy-specific OOD regions, and a separate feedback loop refines a progress-based advantage estimator.</p>
              <p>New policy data is mixed with base demonstrations and used for advantage-weighted behavioral cloning. Across four real-world tasks, this robot-free loop delivers consistent post-training gains and substantially faster data collection than real-robot HG-DAgger.</p>
            </div>
            <aside className="abstract-aside reveal" aria-label="Research thesis">
              <span className="aside-label">CORE THESIS</span>
              <blockquote>Collect where the policy is weak. Learn more from the behaviors that move the task forward.</blockquote>
              <div className="signal-line"><span>Human demonstration</span><i /><span>Policy distribution</span></div>
            </aside>
          </div>

          <div className="contribution-grid">
            {contributions.map((item) => (
              <article className="contribution-card reveal" key={item.index}>
                <div className="card-index">{item.index}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="card-tag">{item.tag}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section method-section" id="method">
        <div className="container">
          <SectionHeading kicker="METHOD" title="A closed loop that never leaves the human hand." description="Two online detectors focus collection; two alternating updates turn targeted demonstrations into a stronger policy." />
          <figure className="media-panel framework-panel reveal">
            <div className="panel-topline"><span>HIL-UMI PIPELINE</span><span className="live-indicator"><i /> POLICY-GUIDED LOOP</span></div>
            <img src={assetUrl('/assets/framework.webp')} alt="HIL-UMI pipeline with online collection, policy and advantage OOD detectors, advantage update, and AWBC policy update" />
            <figcaption>Overview of the alternating HIL-UMI collection and post-training pipeline.</figcaption>
          </figure>

          <div className="method-grid">
            {methodSteps.map((step) => (
              <article className="method-card reveal" key={step.number}>
                <div className="method-card-head"><span>{step.number}</span><small>{step.label}</small></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section hardware-section" id="hardware">
        <div className="container">
          <SectionHeading kicker="HARDWARE" title="Portable collection. Real-time intelligence." description="A custom handheld UMI captures robot-compatible observations and actions at 30 Hz while local GPU inference powers both online detectors." />
          <figure className="media-panel hardware-figure reveal">
            <div className="panel-topline"><span>CUSTOM UMI DEVICE</span><span>ROBOT-FREE · 30 HZ</span></div>
            <img src={assetUrl('/assets/hardware.webp')} alt="Custom HIL-UMI hardware with Quest controller and headset, RealSense cameras, connector, and AgiBot OmniPicker" />
          </figure>

          <div className="hardware-list reveal">
            {hardware.map(([index, title, detail]) => (
              <div className="hardware-item" key={index}>
                <span>{index}</span><div><h3>{title}</h3><p>{detail}</p></div>
              </div>
            ))}
          </div>

          <div className="latency-band reveal">
            <div className="latency-copy"><span>ONLINE INFERENCE</span><strong>Fast enough to guide collection as it happens.</strong></div>
            <div className="latency-metric"><strong>112<small> ms</small></strong><span>Policy OOD detector</span></div>
            <div className="latency-metric"><strong>93<small> ms</small></strong><span>Advantage OOD detector</span></div>
          </div>
        </div>
      </section>

      <section className="section demos-section" id="demos">
        <div className="container">
          <SectionHeading kicker="REAL-WORLD TASKS" title="Long-horizon reasoning meets precision control." description="Evaluation spans deformable objects, household sequences, spatial stacking, and tight pose alignment." />
          <div className="task-grid">
            {tasks.map((task, index) => (
              <article className="task-card reveal" key={task.name}>
                <div className="task-media">
                  <VideoComparison taskName={task.name} videos={task.videos} />
                  <span className="task-number">0{index + 1}</span>
                </div>
                <div className="task-content">
                  <span>{task.kind}</span>
                  <h3>{task.name}</h3>
                  <p>{task.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section results-section" id="results">
        <div className="results-grid-bg" aria-hidden="true" />
        <div className="container">
          <SectionHeading light kicker="EXPERIMENTS" title="Better data beats simply more data." description="Under matched per-round data budgets, HIL-UMI improves consistently while conventional UMI-based supervised fine-tuning plateaus." />

          <div className="results-metrics">
            <article className="result-metric reveal"><span>COLLECTION EFFICIENCY</span><strong>5.63<sup>×</sup></strong><p>faster per frame than real-robot HG-DAgger on Clean Up Table</p></article>
            <article className="result-metric reveal"><span>FINAL PERFORMANCE</span><strong>≈100</strong><p>Task Progress Score after iterative HIL-UMI post-training</p></article>
            <article className="result-metric reveal"><span>GENERALITY</span><strong>4</strong><p>challenging real-world long-horizon and precision tasks</p></article>
          </div>

          <figure className="results-figure reveal">
            <div className="panel-topline"><span>POST-TRAINING PROGRESSION</span><span>MEAN OF 10 TRIALS · EACH CHECKPOINT</span></div>
            <div className="results-image-wrap"><img src={assetUrl('/assets/results-overview.webp')} alt="Task Progress Score across post-training rounds for SFT, HIL-UMI without advantage, and full HIL-UMI on four tasks and their average" /></div>
            <figcaption>Full HIL-UMI produces sustained gains across every evaluated task; removing advantage weighting leads to a clear performance drop.</figcaption>
          </figure>

          <div className="comparison-band reveal">
            <div className="comparison-title"><span>Clean Up Table</span><h3>Robot-free collection changes the economics of iteration.</h3></div>
            <div className="comparison-bars">
              <div><span>HIL-UMI</span><i style={{ '--bar': '17.8%' } as React.CSSProperties} /><strong>73.40 ms/frame</strong></div>
              <div><span>HG-DAgger</span><i className="muted-bar" style={{ '--bar': '100%' } as React.CSSProperties} /><strong>412.99 ms/frame</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section citation-section" id="citation">
        <div className="container citation-wrap reveal">
          <div>
            <p className="section-kicker"><span />CITATION</p>
            <h2>Build on HIL-UMI.</h2>
            <p className="citation-copy">For the latest version and citation metadata, see <a href={arxivUrl} target="_blank" rel="noreferrer">arXiv:2609.20659</a>.</p>
          </div>
          <div className="citation-card">
            <div className="citation-card-top">
              <span>BIBTEX · ARXIV:2609.20659</span>
              <button className={`copy-button ${copyStatus}`} type="button" onClick={copyBibtex} aria-label="Copy BibTeX citation" aria-live="polite">
                {copyStatus === 'copied' ? '✓ COPIED' : copyStatus === 'error' ? 'TRY AGAIN' : 'COPY'}
              </button>
            </div>
            <pre><code>{bibtex}</code></pre>
          </div>
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <div className="footer-brand"><span className="brand-mark" />HIL-UMI</div>
          <p>Human-in-the-Loop Robot-Free Post-Training</p>
          <a href="#top">Back to top <span>↑</span></a>
        </div>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
