import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-ai-helper',
  templateUrl: './ai-helper.component.html',
  styleUrls: ['./ai-helper.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class AiHelperComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  isLoading = false;
  currentUser: User | null = null;
  messages: Array<{
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    formattedContent?: string;
  }> = [];
  currentMessage = '';
  suggestions = [
    'How do I enroll in a course?',
    'What are the course requirements?',
    'How do I track my progress?',
    'Can I get a certificate?',
    'What if I miss a class?',
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    // Add welcome message
    this.messages.push({
      type: 'ai',
      content:
        "Hello! I'm OTC AI, your learning assistant. How can I help you with your courses today?",
      timestamp: new Date(),
      formattedContent: this.formatMessage(
        "Hello! I'm **OTC AI**, your learning assistant. How can I help you with your courses today?"
      ),
    });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    if (!this.currentMessage.trim()) return;

    // Add user message
    this.messages.push({
      type: 'user',
      content: this.currentMessage,
      timestamp: new Date(),
    });

    const userMessage = this.currentMessage;
    this.currentMessage = '';
    this.isLoading = true;

    // Simulate AI response (replace with actual AI service call)
    setTimeout(() => {
      const aiResponse = this.generateAIResponse(userMessage);
      this.messages.push({
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        formattedContent: this.formatMessage(aiResponse),
      });
      this.isLoading = false;
    }, 1000);
  }

  sendSuggestion(suggestion: string): void {
    this.currentMessage = suggestion;
    this.sendMessage();
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';

    const fullName = this.currentUser.fullNameEn || '';
    if (!fullName.trim()) return 'U';

    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    } else {
      return (
        names[0].charAt(0) + names[names.length - 1].charAt(0)
      ).toUpperCase();
    }
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';

    return this.currentUser.fullNameAr || 'User';
  }

  private formatMessage(message: string): string {
    // Convert markdown-like formatting to HTML
    let formatted = message
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```(.*?)```/gs, '<pre class="code-block"><code>$1</code></pre>')
      // Inline code
      .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
      // Lists
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
      // Numbered lists
      .replace(/^\s*\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="message-header">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="message-header">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="message-header">$1</h1>')
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" class="message-link">$1</a>'
      )
      // Line breaks
      .replace(/\n/g, '<br>');

    // Wrap lists in ul/ol tags
    formatted = formatted.replace(
      /(<li>.*<\/li>)/gs,
      '<ul class="message-list">$1</ul>'
    );

    return formatted;
  }

  private generateAIResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();

    if (message.includes('enroll') || message.includes('join')) {
      return `**Course Enrollment Guide**

To enroll in a course, follow these simple steps:

1. **Navigate to Course Details**: Click on any course card from the course catalog
2. **Click Enroll Button**: Look for the "Enroll" button on the course details page
3. **Login Required**: You'll need to be logged in to your account
4. **Confirmation**: Once enrolled, you'll receive a confirmation

**What happens after enrollment:**
- Access to all course materials
- Progress tracking enabled
- Ability to participate in discussions
- Certificate eligibility

*Note: Some courses may have prerequisites or require approval.*`;
    }

    if (message.includes('requirement') || message.includes('prerequisite')) {
      return `**Course Requirements Overview**

Course requirements vary by course level and complexity:

**Basic Requirements (Most Courses):**
- Computer with internet connection
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic computer literacy
- Stable internet connection

**Advanced Course Requirements:**
- Specific software installations
- Programming knowledge (for coding courses)
- Hardware requirements (for specialized courses)
- Prerequisite courses completion

**Technical Requirements:**
- Minimum 4GB RAM
- 2GB free disk space
- Webcam and microphone (for interactive sessions)

You can find specific requirements in each course's description page.`;
    }

    if (message.includes('progress') || message.includes('track')) {
      return `**Progress Tracking System**

Your learning progress is automatically tracked throughout your course journey:

**What Gets Tracked:**
- Module completion status
- Quiz and assignment scores
- Time spent on materials
- Overall course completion percentage

**How to View Progress:**
1. **Dashboard**: Check your main dashboard for overview
2. **Course Details**: View detailed progress within each course
3. **Progress Bars**: Visual indicators show completion status
4. **Certificates**: Available upon 100% completion

**Progress Features:**
- Automatic saving of your progress
- Resume from where you left off
- Detailed analytics and insights
- Achievement badges and milestones

*Your progress is saved automatically, so you never lose your place!*`;
    }

    if (message.includes('certificate') || message.includes('certification')) {
      return `**Certificate Information**

**Eligibility Requirements:**
- Complete all required modules (100% progress)
- Pass all assessments and quizzes
- Meet minimum attendance requirements
- Submit all required assignments

**Certificate Features:**
- **Digital Format**: Downloadable PDF certificate
- **Verification**: Unique certificate ID for verification
- **Accreditation**: Industry-recognized credentials
- **Sharing**: Easy to share on LinkedIn and other platforms

**How to Access:**
1. Complete your course requirements
2. Navigate to your profile page
3. Go to "Certificates" section
4. Download your certificate

**Certificate Includes:**
- Your name and completion date
- Course title and description
- Instructor signature
- Unique verification code

*Certificates are typically available within 24 hours of course completion.*`;
    }

    if (
      message.includes('miss') ||
      message.includes('absent') ||
      message.includes('class')
    ) {
      return `**Missed Class Policy**

Don't worry if you miss a class! Our platform is designed for flexible learning:

**Catch-Up Options:**
- **Recorded Sessions**: Most live sessions are recorded and available within 24 hours
- **Self-Paced Content**: Core materials are available for self-study
- **Discussion Forums**: Connect with instructors and peers for questions
- **Office Hours**: Schedule one-on-one sessions if needed

**What to Do When You Miss a Class:**
1. Check the course materials section for recordings
2. Review the session notes and slides
3. Complete any missed assignments
4. Reach out to the instructor if you have questions

**Flexible Learning Features:**
- Access materials 24/7
- No penalty for missing live sessions
- Multiple ways to engage with content
- Support from instructors and community

*Remember: Consistent engagement leads to better learning outcomes!*`;
    }

    if (message.includes('help') || message.includes('support')) {
      return `**How Can I Help You?**

I'm here to assist you with all aspects of your learning journey:

**I Can Help With:**
- Course enrollment and navigation
- Understanding requirements and prerequisites
- Progress tracking and completion
- Certificate information and access
- Technical issues and troubleshooting
- Learning strategies and tips

**Quick Actions:**
- **Course Search**: Find specific courses
- **Progress Check**: Review your learning status
- **Technical Support**: Get help with platform issues
- **Account Management**: Update your profile and settings

**Additional Support:**
- **Email Support**: support@otc.com
- **Live Chat**: Available during business hours
- **Help Center**: Comprehensive guides and FAQs
- **Community Forum**: Connect with other learners

*Feel free to ask me anything about your courses or the platform!*`;
    }

    return `I understand you're asking about **"${userMessage}"**. 

Let me help you with that! I can assist with:

**Common Topics:**
- Course enrollment and navigation
- Requirements and prerequisites  
- Progress tracking and completion
- Certificates and credentials
- Technical support and troubleshooting

**What would you like to know more about?** You can ask me specific questions or use the quick suggestion buttons below for common topics.`;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages = [
      {
        type: 'ai',
        content:
          "Hello! I'm OTC AI, your learning assistant. How can I help you with your courses today?",
        timestamp: new Date(),
        formattedContent: this.formatMessage(
          "Hello! I'm **OTC AI**, your learning assistant. How can I help you with your courses today?"
        ),
      },
    ];
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // Handle scroll error
    }
  }
}
