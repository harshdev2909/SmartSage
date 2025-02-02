const steps = [
  {
    number: "01",
    title: "Sign Up",
    description:
      "Create your account in seconds and get instant access to our platform",
  },
  {
    number: "02",
    title: "Set Your Goals",
    description:
      "Tell us what you want to achieve and we'll create a personalized plan",
  },
  {
    number: "03",
    title: "Start Learning",
    description:
      "Get AI-powered assistance and track your progress as you learn",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started with our platform in three simple steps
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-2xl p-8 relative z-10">
                <span className="text-5xl font-bold text-primary/30 mb-4 block">
                  {step.number}
                </span>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 w-1/2 h-px bg-primary/30 -translate-y-1/2 translate-x-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
