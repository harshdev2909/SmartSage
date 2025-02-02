import { BookOpen, Brain, Clock, Users } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Smart Learning Paths",
    description:
      "Personalized study plans that adapt to your learning style and pace",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "24/7 Assistance",
    description:
      "Get help whenever you need it with our always-available AI tutor",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Comprehensive Coverage",
    description: "Support across multiple subjects and topics",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Collaborative Learning",
    description: "Connect with peers and share knowledge effectively",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Features That Make Learning Easier
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover how our AI-powered platform transforms your study
            experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
