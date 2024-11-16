import { 
  TwitterShareButton,
  FacebookShareButton,
  EmailShareButton,
} from 'react-share';
import { 
  FaTwitter, 
  FaFacebook, 
  FaEnvelope, 
  FaLink,
  FaInstagram 
} from 'react-icons/fa';
import { toast } from 'react-toastify';

interface ShareButtonsProps {
  imageData: string;
  prompt: string;
}

export default function ShareButtons({ imageData, prompt }: ShareButtonsProps) {
  const handleShare = async (platform: string) => {
    try {
      // Create a temporary canvas to convert base64 to blob
      const img = new Image();
      img.src = `data:image/png;base64,${imageData}`;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob as Blob))
      );
      
      // Create a File object from the blob
      const file = new File([blob], 'image.png', { type: 'image/png' });

      if (platform === 'instagram') {
        // For Instagram, we need to use the Web Share API if available
        if (navigator.share) {
          await navigator.share({
            files: [file],
            title: 'Check out this AI-generated image!',
            text: prompt
          });
          toast.success('Opening share dialog...');
        } else {
          // Fallback for browsers that don't support Web Share API
          const tempUrl = URL.createObjectURL(blob);
          toast.info('Save the image and share it on Instagram!');
          window.open(tempUrl, '_blank');
        }
      } else {
        // For other platforms, create a temporary URL
        const tempUrl = URL.createObjectURL(blob);
        return tempUrl;
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share image');
    }
  };

  return (
    <div className="flex gap-2">
      <TwitterShareButton
        url={window.location.href}
        title={`Check out this AI-generated image: ${prompt}`}
        className="hover:opacity-80"
        beforeOnClick={() => handleShare('twitter')}
      >
        <FaTwitter className="w-5 h-5 text-[#1DA1F2]" />
      </TwitterShareButton>

      <FacebookShareButton
        url={window.location.href}
        quote={`Check out this AI-generated image: ${prompt}`}
        className="hover:opacity-80"
        beforeOnClick={() => handleShare('facebook')}
      >
        <FaFacebook className="w-5 h-5 text-[#4267B2]" />
      </FacebookShareButton>

      <button
        onClick={() => handleShare('instagram')}
        className="hover:opacity-80"
      >
        <FaInstagram className="w-5 h-5 text-[#E1306C]" />
      </button>

      <EmailShareButton
        url={window.location.href}
        subject="Check out this AI-generated image!"
        body={`I wanted to share this AI-generated image with you: ${prompt}`}
        className="hover:opacity-80"
        beforeOnClick={() => handleShare('email')}
      >
        <FaEnvelope className="w-5 h-5 text-gray-400" />
      </EmailShareButton>

      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
          } catch (error) {
            toast.error('Failed to copy link');
            console.error('Error copying link:', error);
          }
        }}
        className="hover:opacity-80"
      >
        <FaLink className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
}
