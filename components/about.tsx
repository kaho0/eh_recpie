const contactCards = [
  {
    title: "Phone",
    value: "207-8767-452",
    helper: "Mon-Fri, 9am-6pm EST",
  },
  {
    title: "WhatsApp",
    value: "082-123-234-345",
    helper: "Quick questions welcome",
  },
  {
    title: "Email",
    value: "support@yoursite.com",
    helper: "We reply within 1 business day",
  },
  {
    title: "Our Shop",
    value: "2443 Oak Ridge Omaha, QA 45065",
    helper: "Open daily 10am - 8pm",
  },
]

export default function About() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Need a hand?</p>
          <h2 className="text-4xl font-serif font-bold text-foreground">Contact Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you have a recipe question, partnership inquiry, or just want to say hi, we’re here for you. Reach
            out using any of the options below and our team will follow up shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{card.title}</p>
                  <p className="text-lg font-serif text-foreground mt-2">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.helper}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden border border-border h-72">
              <iframe
                title="Olive Kitchen HQ"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243646.0539753148!2d-0.5103759237869826!3d51.50136409874219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761b32a4dfb8ff%3A0x52963a5addd6580!2sLondon%2C%20UK!5e0!3m2!1sen!2sus!4v1732059770000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background/80 p-8 shadow-lg space-y-6">
            <div>
              <h3 className="text-2xl font-serif font-semibold text-foreground">Get in touch</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Send us a note and we’ll respond as soon as possible. Fields marked with * are required.
              </p>
            </div>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm text-muted-foreground">
                  Name*
                  <input type="text" required className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </label>
                <label className="text-sm text-muted-foreground">
                  Email*
                  <input
                    type="email"
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
              </div>
              <label className="text-sm text-muted-foreground">
                Subject
                <input className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </label>
              <label className="text-sm text-muted-foreground">
                Message*
                <textarea
                  required
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
              </label>
              <button
                type="button"
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Send now
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-border pt-10">
          <div>
            <p className="font-serif text-lg text-foreground">Our Store</p>
            <p className="text-sm text-muted-foreground mt-2">2443 Oak Ridge Omaha, QA 45065</p>
          </div>
          <div>
            <p className="font-serif text-lg text-foreground">Further links</p>
            <p className="text-sm text-muted-foreground mt-2">Terms & Conditions • News • Learning</p>
          </div>
          <div>
            <p className="font-serif text-lg text-foreground">Get in touch</p>
            <p className="text-sm text-muted-foreground mt-2">
              support@yoursite.com <br />
              207-8767-452
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
