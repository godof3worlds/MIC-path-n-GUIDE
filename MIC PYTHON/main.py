import json
import os
import webbrowser
from pathlib import Path
import tkinter as tk
from tkinter import ttk

import requests

STATE_FILE = Path(__file__).with_name("microsoft_certifications_done.json")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def get_microsoft_certifications():
    url = "https://learn.microsoft.com/api/learn/catalog/"

    try:
        response = requests.get(url, timeout=20)
    except requests.RequestException as exc:
        print(f"Failed to fetch certifications: {exc}")
        return []

    if response.status_code != 200:
        print(f"Failed to fetch data: {response.status_code}")
        return []

    data = response.json()
    certifications = data.get("certifications", [])

    extracted_certs = []
    for cert in certifications:
        extracted_certs.append(
            {
                "uid": cert.get("uid"),
                "title": cert.get("title"),
                "summary": cert.get("summary") or "No summary provided.",
                "url": cert.get("url"),
                "type": cert.get("type"),
                "levels": cert.get("levels", []),
                "roles": cert.get("roles", []),
            }
        )

    return extracted_certs


class MicrosoftCertificationTracker(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Microsoft Certifications Tracker")
        self.geometry("1200x760")
        self.minsize(1000, 600)

        self.certifications = []
        self.filtered_certifications = []
        self.done_ids = self.load_done_state()

        self.style = ttk.Style(self)
        try:
            self.style.theme_use("clam")
        except tk.TclError:
            pass

        self.colors = {
            "background": "#071522",
            "surface": "#101b2b",
            "surface_alt": "#141b2d",
            "border": "#2a3a50",
            "text": "#f2f6fb",
            "muted": "#91a3bb",
            "cyan": "#18d6f2",
            "blue": "#3f8cff",
            "green": "#00d69f",
            "purple": "#b77cff",
        }
        self.configure(bg=self.colors["background"])
        self.style.configure(
            "Dashboard.TButton",
            background=self.colors["surface_alt"],
            foreground=self.colors["text"],
            bordercolor=self.colors["border"],
            lightcolor=self.colors["border"],
            darkcolor=self.colors["surface_alt"],
            padding=(12, 7),
            font=("Segoe UI", 9, "bold"),
        )
        self.style.map(
            "Dashboard.TButton",
            background=[("active", "#20334b")],
            foreground=[("active", self.colors["cyan"])],
        )
        self.style.configure(
            "Dashboard.TCombobox",
            fieldbackground=self.colors["surface_alt"],
            background=self.colors["surface_alt"],
            foreground=self.colors["text"],
            bordercolor=self.colors["border"],
            arrowcolor=self.colors["cyan"],
            padding=7,
        )
        self.style.configure(
            "Dashboard.Vertical.TScrollbar",
            background=self.colors["surface_alt"],
            troughcolor=self.colors["background"],
            arrowcolor=self.colors["muted"],
        )
        self.build_ui()
        self.refresh_certifications()

    def load_done_state(self):
        if not STATE_FILE.exists():
            return set()

        try:
            with STATE_FILE.open("r", encoding="utf-8") as file:
                data = json.load(file)
                if isinstance(data, list):
                    return set(data)
        except (json.JSONDecodeError, OSError):
            pass

        return set()

    def save_done_state(self):
        try:
            with STATE_FILE.open("w", encoding="utf-8") as file:
                json.dump(sorted(self.done_ids), file, indent=2)
        except OSError as exc:
            print(f"Unable to save certification state: {exc}")

    def build_ui(self):
        self.columnconfigure(0, weight=1)
        self.rowconfigure(4, weight=1)

        header = tk.Frame(self, bg=self.colors["background"], padx=28, pady=18)
        header.grid(row=0, column=0, sticky="ew")
        header.grid_columnconfigure(2, weight=1)

        logo = tk.Label(
            header,
            text="🎙",
            font=("Segoe UI Symbol", 20, "bold"),
            fg="#ffffff",
            bg="#176cff",
            padx=12,
            pady=4,
        )
        logo.grid(row=0, column=0, rowspan=2, padx=(0, 16))

        eyebrow = tk.Label(
            header,
            text="MICROSOFT LEARN  /  CERTIFICATION ROADMAP",
            font=("Segoe UI", 9, "bold"),
            fg=self.colors["cyan"],
            bg=self.colors["background"],
        )
        eyebrow.grid(row=0, column=1, sticky="w")

        title_label = tk.Label(
            header,
            text="Learning Path Tracker",
            font=("Segoe UI", 24, "bold"),
            fg=self.colors["text"],
            bg=self.colors["background"],
        )
        title_label.grid(row=1, column=1, sticky="w")

        self.summary_label = tk.Label(
            header,
            text="Loading learning path...",
            font=("Segoe UI", 9),
            fg=self.colors["muted"],
            bg=self.colors["background"],
        )
        self.summary_label.grid(row=2, column=1, sticky="w", pady=(3, 0))

        self.progress_badge = tk.Label(
            header,
            text="0% COMPLETE",
            font=("Segoe UI", 9, "bold"),
            fg=self.colors["green"],
            bg="#102d32",
            padx=12,
            pady=7,
        )
        self.progress_badge.grid(row=1, column=3, padx=(16, 0), sticky="e")

        assistant_button = ttk.Button(
            header,
            text="AI Study Assistant",
            style="Dashboard.TButton",
            command=self.open_study_assistant,
        )
        assistant_button.grid(row=2, column=3, padx=(16, 0), sticky="e")

        overview = tk.Frame(self, bg=self.colors["background"], padx=28, pady=8)
        overview.grid(row=1, column=0, sticky="ew")
        overview.columnconfigure(0, weight=1)
        overview.columnconfigure(1, weight=1)
        overview.columnconfigure(2, weight=1)
        overview.columnconfigure(3, weight=1)
        metrics = (
            ("PATH COMPLETION", "0", self.colors["cyan"]),
            ("CERTIFICATIONS", "0", self.colors["blue"]),
            ("UNLOCKED", "0", self.colors["green"]),
            ("NEXT MILESTONE", "Keep learning", self.colors["purple"]),
        )
        self.metric_values = []
        for index, (label, value, accent) in enumerate(metrics):
            metric = tk.Frame(
                overview,
                bg=self.colors["surface"],
                highlightbackground=self.colors["border"],
                highlightthickness=1,
                padx=16,
                pady=10,
            )
            metric.grid(row=0, column=index, sticky="ew", padx=(0 if index == 0 else 5, 5 if index < 3 else 0))
            tk.Label(metric, text=label, font=("Segoe UI", 8, "bold"), fg=accent, bg=self.colors["surface"]).pack(anchor="w")
            value_label = tk.Label(metric, text=value, font=("Segoe UI", 16, "bold"), fg=self.colors["text"], bg=self.colors["surface"])
            value_label.pack(anchor="w", pady=(3, 0))
            self.metric_values.append(value_label)

        controls = tk.Frame(self, bg=self.colors["surface"], padx=16, pady=12, highlightbackground=self.colors["border"], highlightthickness=1)
        controls.grid(row=2, column=0, sticky="ew", padx=28, pady=(8, 0))
        controls.columnconfigure(1, weight=1)

        search_label = tk.Label(
            controls,
            text="⌕",
            font=("Segoe UI", 10, "bold"),
            fg=self.colors["cyan"],
            bg=self.colors["surface"],
        )
        search_label.grid(row=0, column=0, padx=(0, 8), sticky="w")

        self.search_var = tk.StringVar()
        self.search_entry = tk.Entry(
            controls,
            textvariable=self.search_var,
            font=("Segoe UI", 10),
            width=40,
            bg="#0c1625",
            fg=self.colors["text"],
            insertbackground=self.colors["cyan"],
            relief="flat",
            highlightbackground=self.colors["border"],
            highlightcolor=self.colors["cyan"],
            highlightthickness=1,
        )
        self.search_entry.grid(row=0, column=1, sticky="ew")
        self.search_entry.bind("<Return>", lambda event: self.render_certifications())

        self.type_var = tk.StringVar(value="All")
        self.type_combobox = ttk.Combobox(
            controls,
            textvariable=self.type_var,
            state="readonly",
            width=24,
            style="Dashboard.TCombobox",
        )
        self.type_combobox.grid(row=0, column=2, padx=(12, 8), sticky="ew")
        self.type_combobox.bind("<<ComboboxSelected>>", lambda event: self.render_certifications())

        search_button = ttk.Button(controls, text="Apply Filters", style="Dashboard.TButton", command=self.render_certifications)
        search_button.grid(row=0, column=3, padx=(0, 8))

        reset_button = ttk.Button(controls, text="Reset Path", style="Dashboard.TButton", command=self.reset_filters)
        reset_button.grid(row=0, column=4)

        refresh_button = ttk.Button(controls, text="Refresh", style="Dashboard.TButton", command=self.refresh_certifications)
        refresh_button.grid(row=0, column=5, padx=(8, 0))

        self.status_label = tk.Label(
            self,
            text="",
            font=("Segoe UI", 9),
            fg=self.colors["muted"],
            bg=self.colors["background"],
            padx=14,
            pady=6,
        )
        self.status_label.grid(row=3, column=0, sticky="ew")

        canvas_outer = tk.Frame(self, bg=self.colors["background"])
        canvas_outer.grid(row=4, column=0, sticky="nsew", padx=28, pady=(0, 18))
        canvas_outer.columnconfigure(0, weight=1)
        canvas_outer.rowconfigure(0, weight=1)

        self.canvas = tk.Canvas(canvas_outer, bg=self.colors["background"], highlightthickness=0)
        self.canvas.grid(row=0, column=0, sticky="nsew")

        scrollbar = ttk.Scrollbar(canvas_outer, orient="vertical", style="Dashboard.Vertical.TScrollbar", command=self.canvas.yview)
        scrollbar.grid(row=0, column=1, sticky="ns")
        self.canvas.configure(yscrollcommand=scrollbar.set)

        self.cards_container = tk.Frame(self.canvas, bg=self.colors["background"])
        self.cards_window = self.canvas.create_window((0, 0), window=self.cards_container, anchor="nw")

        self.cards_container.bind("<Configure>", self.on_container_configure)
        self.canvas.bind("<Configure>", self.on_canvas_configure)

    def on_container_configure(self, event):
        self.canvas.configure(scrollregion=self.canvas.bbox("all"))

    def on_canvas_configure(self, event):
        self.canvas.itemconfig(self.cards_window, width=event.width)

    def reset_filters(self):
        self.search_var.set("")
        self.type_var.set("All")
        self.render_certifications()

    def refresh_certifications(self):
        self.status_label.config(text="Fetching the latest Microsoft certifications...")
        self.certifications = get_microsoft_certifications()

        if not self.certifications:
            self.status_label.config(text="Unable to load certifications right now. Please try again.")
            self.filtered_certifications = []
            self.render_certifications()
            return

        types = sorted({cert["type"] for cert in self.certifications if cert.get("type")})
        self.type_combobox.configure(values=["All", *types])
        self.type_var.set(self.type_var.get() if self.type_var.get() in ["All", *types] else "All")
        self.status_label.config(text=f"Loaded {len(self.certifications)} Microsoft certifications.")
        self.render_certifications()

    def render_certifications(self):
        for widget in self.cards_container.winfo_children():
            widget.destroy()

        q = self.search_var.get().strip().lower()
        selected_type = self.type_var.get()

        filtered = []
        for cert in self.certifications:
            title = (cert.get("title") or "").lower()
            summary = (cert.get("summary") or "").lower()
            type_value = cert.get("type") or "Unknown"

            if q and q not in title and q not in summary and q not in (cert.get("uid") or "").lower():
                continue
            if selected_type != "All" and type_value != selected_type:
                continue
            filtered.append(cert)

        self.filtered_certifications = filtered
        completed_count = sum(1 for cert in filtered if cert.get("uid") in self.done_ids)
        total_count = len(self.certifications)
        total_completed = sum(1 for cert in self.certifications if cert.get("uid") in self.done_ids)
        completion_percent = round(total_completed / total_count * 100) if total_count else 0

        self.progress_badge.config(text=f"{completion_percent}% COMPLETE")
        self.metric_values[0].config(text=f"{completion_percent}%")
        self.metric_values[1].config(text=str(total_count))
        self.metric_values[2].config(text=str(total_count - total_completed))
        self.metric_values[3].config(text="Ready to explore" if filtered else "No matches")

        self.summary_label.config(
            text=(
                f"Showing {len(filtered)} certifications • "
                f"Completed: {completed_count} • Pending: {len(filtered) - completed_count}"
            )
        )

        if not filtered:
            empty_label = tk.Label(
                self.cards_container,
                text="No certifications match the current filters.",
                bg=self.colors["background"],
                fg=self.colors["muted"],
                font=("Segoe UI", 11),
                padx=12,
                pady=30,
            )
            empty_label.pack(anchor="w")
            return

        for cert in filtered:
            uid = cert.get("uid") or "unknown"
            title = cert.get("title") or "Untitled Certification"
            summary = cert.get("summary") or "No summary available."
            cert_type = cert.get("type") or "Certification"
            levels = cert.get("levels", [])
            roles = cert.get("roles", [])
            is_done = uid in self.done_ids

            card_bg = "#102a2b" if is_done else self.colors["surface"]
            border_color = self.colors["green"] if is_done else self.colors["border"]
            status_text = "COMPLETED" if is_done else "IN PROGRESS"

            card = tk.Frame(
                self.cards_container,
                bg=card_bg,
                highlightbackground=border_color,
                highlightthickness=1,
                padx=16,
                pady=14,
                bd=0,
            )
            card.pack(fill="x", padx=4, pady=8)

            header = tk.Frame(card, bg=card_bg)
            header.pack(fill="x")

            title_label = tk.Label(
                header,
                text=title,
                font=("Segoe UI", 13, "bold"),
                fg=self.colors["text"],
                bg=card_bg,
                justify="left",
                wraplength=760,
            )
            title_label.pack(anchor="w")

            meta = tk.Label(
                header,
                text=f"{cert_type} • {', '.join(levels) if levels else 'General'} • {', '.join(roles) if roles else 'No specific role'}",
                font=("Segoe UI", 9),
                fg=self.colors["muted"],
                bg=card_bg,
                justify="left",
                wraplength=760,
            )
            meta.pack(anchor="w", pady=(4, 8))

            summary_label = tk.Label(
                card,
                text=summary,
                font=("Segoe UI", 10),
                fg="#c1cedf",
                bg=card_bg,
                justify="left",
                wraplength=820,
            )
            summary_label.pack(anchor="w")

            footer = tk.Frame(card, bg=card_bg)
            footer.pack(fill="x", pady=(12, 0))
            footer.columnconfigure(0, weight=1)

            status_label = tk.Label(
                footer,
                text=status_text,
                font=("Segoe UI", 9, "bold"),
                fg=self.colors["green"] if is_done else self.colors["cyan"],
                bg=card_bg,
            )
            status_label.grid(row=0, column=0, sticky="w")

            done_var = tk.BooleanVar(value=is_done)
            done_checkbox = tk.Checkbutton(
                footer,
                text="Mark done",
                variable=done_var,
                fg=self.colors["muted"],
                bg=card_bg,
                activebackground=card_bg,
                activeforeground=self.colors["text"],
                selectcolor="#1c3046",
                highlightthickness=0,
                command=lambda uid=uid, var=done_var: self.toggle_done(uid, var.get()),
            )
            done_checkbox.grid(row=0, column=1, sticky="e")

            open_button = ttk.Button(
                footer,
                text="Open details",
                style="Dashboard.TButton",
                command=lambda url=cert.get("url"): self.open_url(url),
            )
            open_button.grid(row=0, column=2, padx=(10, 0), sticky="e")

    def toggle_done(self, uid, is_done):
        if is_done:
            self.done_ids.add(uid)
        else:
            self.done_ids.discard(uid)
        self.save_done_state()
        self.render_certifications()

    def open_url(self, url):
        if url:
            webbrowser.open(url)

    def open_study_assistant(self):
        if getattr(self, "assistant_window", None) is not None and self.assistant_window.winfo_exists():
            self.assistant_window.lift()
            self.assistant_input.focus_set()
            return

        self.assistant_window = tk.Toplevel(self)
        self.assistant_window.title("AI Study Assistant")
        self.assistant_window.geometry("520x620")
        self.assistant_window.minsize(420, 480)
        self.assistant_window.configure(bg=self.colors["background"])
        self.assistant_window.protocol("WM_DELETE_WINDOW", self.close_study_assistant)

        assistant_header = tk.Frame(
            self.assistant_window,
            bg=self.colors["surface"],
            padx=20,
            pady=16,
        )
        assistant_header.pack(fill="x")
        tk.Label(
            assistant_header,
            text="AI STUDY ASSISTANT",
            font=("Segoe UI", 9, "bold"),
            fg=self.colors["cyan"],
            bg=self.colors["surface"],
        ).pack(anchor="w")
        tk.Label(
            assistant_header,
            text="Your focused guide for the Microsoft Learn path",
            font=("Segoe UI", 14, "bold"),
            fg=self.colors["text"],
            bg=self.colors["surface"],
        ).pack(anchor="w", pady=(4, 0))

        self.assistant_chat = tk.Text(
            self.assistant_window,
            wrap="word",
            state="disabled",
            font=("Segoe UI", 10),
            bg="#0c1625",
            fg=self.colors["text"],
            insertbackground=self.colors["cyan"],
            relief="flat",
            padx=16,
            pady=16,
            spacing3=6,
        )
        self.assistant_chat.pack(fill="both", expand=True, padx=16, pady=(16, 8))
        self.assistant_chat.tag_configure("assistant", foreground=self.colors["cyan"], font=("Segoe UI", 10, "bold"))
        self.assistant_chat.tag_configure("user", foreground=self.colors["purple"], font=("Segoe UI", 10, "bold"))
        self.assistant_chat.tag_configure("body", foreground="#c1cedf")

        quick_actions = tk.Frame(self.assistant_window, bg=self.colors["background"])
        quick_actions.pack(fill="x", padx=16, pady=(0, 8))
        for prompt in ("What should I study next?", "Make me a study plan", "Explain the learning path"):
            ttk.Button(
                quick_actions,
                text=prompt,
                style="Dashboard.TButton",
                command=lambda value=prompt: self.ask_study_assistant(value),
            ).pack(side="left", padx=(0, 6))

        input_bar = tk.Frame(self.assistant_window, bg=self.colors["surface"], padx=12, pady=12)
        input_bar.pack(fill="x", padx=16, pady=(0, 16))
        tk.Label(
            input_bar,
            text="ASK YOUR STUDY QUESTION",
            font=("Segoe UI", 8, "bold"),
            fg=self.colors["cyan"],
            bg=self.colors["surface"],
        ).pack(anchor="w", pady=(0, 6))
        self.assistant_input = tk.Text(
            input_bar,
            height=3,
            wrap="word",
            font=("Segoe UI", 10),
            bg="#0c1625",
            fg=self.colors["text"],
            insertbackground=self.colors["cyan"],
            relief="flat",
            highlightbackground=self.colors["border"],
            highlightcolor=self.colors["cyan"],
            highlightthickness=1,
        )
        self.assistant_input.pack(side="left", fill="both", expand=True, padx=(0, 8))
        self.assistant_input.bind("<Control-Return>", lambda event: self.ask_study_assistant())
        ttk.Button(
            input_bar,
            text="Send",
            style="Dashboard.TButton",
            command=self.ask_study_assistant,
        ).pack(side="right")

        self.add_assistant_message(
            "assistant",
            "Hi. I can help you choose what to study next, build a focused plan, or explain any loaded certification. What are you working toward?",
        )
        self.assistant_input.focus_set()

    def close_study_assistant(self):
        if getattr(self, "assistant_window", None) is not None:
            self.assistant_window.destroy()
        self.assistant_window = None

    def add_assistant_message(self, speaker, message):
        self.assistant_chat.configure(state="normal")
        label = "YOU" if speaker == "user" else "ASSISTANT"
        self.assistant_chat.insert("end", f"{label}\n", speaker)
        self.assistant_chat.insert("end", f"{message}\n\n", "body")
        self.assistant_chat.configure(state="disabled")
        self.assistant_chat.see("end")

    def ask_study_assistant(self, prompt=None):
        if prompt is None:
            prompt = self.assistant_input.get("1.0", "end-1c").strip()
        if not prompt:
            return

        self.add_assistant_message("user", prompt)
        self.assistant_input.delete("1.0", "end")
        self.assistant_input.configure(state="disabled")
        self.assistant_window.update_idletasks()
        self.add_assistant_message("assistant", "Thinking...")
        self.assistant_window.after(10, lambda: self.fetch_ai_reply(prompt))

    def fetch_ai_reply(self, prompt):
        reply = self.get_gemini_reply(prompt)
        if self.assistant_window.winfo_exists():
            self.assistant_chat.configure(state="normal")
            last_message = self.assistant_chat.search("Thinking...", "end", backwards=True)
            if last_message:
                self.assistant_chat.delete(last_message, f"{last_message} lineend")
                self.assistant_chat.insert(last_message, reply, "body")
            self.assistant_chat.configure(state="disabled")
            self.assistant_chat.see("end")
            self.assistant_input.configure(state="normal")
            self.assistant_input.focus_set()

    def get_gemini_reply(self, prompt):
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key or api_key == "MY_GEMINI_API_KEY":
            return self.get_study_assistant_reply(prompt)

        available = [cert for cert in self.certifications if cert.get("uid") not in self.done_ids]
        context = "\n".join(
            f"- {cert.get('uid')}: {cert.get('title')} ({cert.get('type') or 'Certification'})"
            for cert in self.certifications[:30]
        ) or "No certification records are currently loaded."
        completed = len(self.certifications) - len(available)
        instruction = (
            "You are a concise Microsoft certification study coach. Give practical, accurate guidance. "
            "Use only the certification context below for claims about this user's path. "
            "Do not pretend to access private data, and recommend official Microsoft Learn resources. "
            f"The user has completed {completed} of {len(self.certifications)} loaded certifications.\n\n"
            f"CERTIFICATION CONTEXT:\n{context}\n\nUSER QUESTION:\n{prompt}"
        )
        payload = {
            "contents": [{"role": "user", "parts": [{"text": instruction}]}],
            "generationConfig": {"temperature": 0.4, "maxOutputTokens": 500},
        }

        try:
            response = requests.post(
                GEMINI_API_URL,
                params={"key": api_key},
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except (requests.RequestException, KeyError, IndexError, TypeError, ValueError) as exc:
            print(f"Gemini request failed: {exc}")
            return (
                "Gemini is unavailable right now, so here is the built-in study guidance instead:\n\n"
                f"{self.get_study_assistant_reply(prompt)}"
            )

    def get_study_assistant_reply(self, prompt):
        prompt_lower = prompt.lower()
        available = [cert for cert in self.certifications if cert.get("uid") not in self.done_ids]
        completed = len(self.certifications) - len(available)

        if not self.certifications:
            return "I do not have certification data yet. Refresh the learning path, then ask me again."

        if "next" in prompt_lower or "recommend" in prompt_lower:
            next_cert = available[0] if available else self.certifications[0]
            return (
                f"Start with {next_cert.get('title', 'the next certification')}. "
                f"It is a {next_cert.get('type', 'certification')} focused on "
                f"{', '.join(next_cert.get('roles', [])) or 'core Microsoft skills'}. "
                "Study the official learning paths first, then use practice questions to find weak areas."
            )

        if "plan" in prompt_lower or "schedule" in prompt_lower:
            next_title = available[0].get("title", "your next certification") if available else "review and practice"
            return (
                f"Here is a focused 7-day plan for {next_title}: Days 1-2 learn the core concepts; "
                "Days 3-4 complete the related Microsoft Learn modules; Day 5 build a small hands-on exercise; "
                "Day 6 take a practice assessment; Day 7 review every missed question and set a retake goal."
            )

        if "path" in prompt_lower or "progress" in prompt_lower or "done" in prompt_lower:
            return (
                f"You have completed {completed} of {len(self.certifications)} loaded certifications. "
                "Use the search and type filters to narrow your next study session. I recommend finishing one "
                "certification before switching tracks, then marking it done here to keep your path current."
            )

        matching = [cert for cert in self.certifications if prompt_lower in (cert.get("title") or "").lower()]
        if matching:
            cert = matching[0]
            return (
                f"{cert.get('title')} covers {cert.get('summary', 'the selected Microsoft skill area')} "
                f"Suggested focus: {', '.join(cert.get('levels', [])) or 'fundamentals'}, followed by hands-on practice."
            )

        return (
            "Try asking me 'What should I study next?', 'Make me a study plan', or 'Explain the learning path'. "
            "You can also mention a certification title for a focused recommendation."
        )


if __name__ == "__main__":
    app = MicrosoftCertificationTracker()
    app.mainloop()