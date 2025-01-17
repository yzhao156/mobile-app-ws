package com.yzhao156.app.ws.shared;

import org.springframework.stereotype.Service;

import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.ClasspathPropertiesFileCredentialsProvider;
import com.amazonaws.auth.EnvironmentVariableCredentialsProvider;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailService;
import com.amazonaws.services.simpleemail.AmazonSimpleEmailServiceClientBuilder;
import com.amazonaws.services.simpleemail.model.Body;
import com.amazonaws.services.simpleemail.model.Content;
import com.amazonaws.services.simpleemail.model.Destination;
import com.amazonaws.services.simpleemail.model.Message;
import com.amazonaws.services.simpleemail.model.SendEmailRequest;
import com.amazonaws.services.simpleemail.model.SendEmailResult;
import com.yzhao156.app.ws.shared.dto.UserDto;
 
@Service
public class AmazonSES {
	// This address must be verified with Amazon SES.
	final String FROM = "zhaoyi8650881@gmail.com";

	// The subject line for the email.
	final String SUBJECT = "One last step to complete your registration with PhotoApp";
	
	final String PASSWORD_RESET_SUBJECT = "Password reset request";

	// The HTML body for the email.
	final String HTMLBODY = "<h1>Please verify your email address</h1>"
			+ "<p>Thank you for registering with our mobile app. To complete registration process and be able to log in,"
			+ " click on the following link: "
			+ "<a href='http://ec2-13-59-72-31.us-east-2.compute.amazonaws.com:8080/verification-service/email-verification.html?token=$tokenValue'>"
			+ "Final step to complete your registration" + "</a><br/><br/>"
			+ "Thank you! And we are waiting for you inside!";

	// The email body for recipients with non-HTML email clients.
	final String TEXTBODY = "Please verify your email address. "
			+ "Thank you for registering with our mobile app. To complete registration process and be able to log in,"
			+ " open then the following URL in your browser window: "
			+ " http://http://ec2-13-59-72-31.us-east-2.compute.amazonaws.com:8080/verification-service/email-verification.html?token=$tokenValue"
			+ " Thank you! And we are waiting for you inside!";
	
	
	final String PASSWORD_RESET_HTMLBODY = "<h1>A request to reset your password</h1>"
		      + "<p>Hi, $firstName!</p> "
		      + "<p>Someone has requested to reset your password with our project. If it were not you, please ignore it."
		      + " otherwise please click on the link below to set a new password: " 
		      + "<a href='http://http://ec2-13-59-72-31.us-east-2.compute.amazonaws.com:8080/verification-service/password-reset.html?token=$tokenValue'>"
		      + " Click this link to Reset Password"
		      + "</a><br/><br/>"
		      + "Thank you!";

		  // The email body for recipients with non-HTML email clients.
		  final String PASSWORD_RESET_TEXTBODY = "A request to reset your password "
		      + "Hi, $firstName! "
		      + "Someone has requested to reset your password with our project. If it were not you, please ignore it."
		      + " otherwise please open the link below in your browser window to set a new password:" 
		      + " http://http://ec2-13-59-72-31.us-east-2.compute.amazonaws.com:8080/verification-service/password-reset.html?token=$tokenValue"
		      + " Thank you!";
	

	public void verifyEmail(UserDto userDto) {

		// You can also set your keys this way. And it will work!
		//System.setProperty("aws.accessKeyId", "<YOUR KEY ID HERE>"); 
		//System.setProperty("aws.secretKey", "<SECRET KEY HERE>"); 
		
		AmazonSimpleEmailService client = AmazonSimpleEmailServiceClientBuilder.standard().withRegion(Regions.CA_CENTRAL_1)
				.build();
 
		String htmlBodyWithToken = HTMLBODY.replace("$tokenValue", userDto.getEmailVerificationToken());
		String textBodyWithToken = TEXTBODY.replace("$tokenValue", userDto.getEmailVerificationToken());

		SendEmailRequest request = new SendEmailRequest()
				.withDestination(new Destination().withToAddresses(userDto.getEmail()))
				.withMessage(new Message()
						.withBody(new Body().withHtml(new Content().withCharset("UTF-8").withData(htmlBodyWithToken))
								.withText(new Content().withCharset("UTF-8").withData(textBodyWithToken)))
						.withSubject(new Content().withCharset("UTF-8").withData(SUBJECT)))
				.withSource(FROM);

		client.sendEmail(request);

		System.out.println("Email sent!");

	}

	 public boolean sendPasswordResetRequest(String firstName, String email, String token)
	  {
	      boolean returnValue = false;
	      
	      
		BasicAWSCredentials awsCreds = new BasicAWSCredentials("AKIATSGCTQQYNTBL6ZMC", "Ng7jU3gWRLwjCpXvWCB6LFhlJhRxT1o8Fn40eJ4v");
		AmazonSimpleEmailService client = AmazonSimpleEmailServiceClientBuilder.standard()
				.withCredentials(new AWSStaticCredentialsProvider(awsCreds)).withRegion(Regions.CA_CENTRAL_1).build();
//	      System.setProperty("aws.accessKeyId", "AKIATSGCTQQYNTBL6ZMC"); 	
//	      System.setProperty("aws.secretKey", "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"); 
	      
//	      BasicAWSCredentials awsCreds = new BasicAWSCredentials("aws_access_key_id", "aws_secret_access_key");
//	      AmazonSimpleEmailService client = AmazonSimpleEmailServiceClientBuilder.standard().withCredentials(new
//	            AWSStaticCredentialsProvider(awsCreds)).withRegion(Regions.CA_CENTRAL_1)
//	            .build();
	      
//	      AWSCredentialsProvider provider = new ClasspathPropertiesFileCredentialsProvider();
//          AmazonSimpleEmailService client = AmazonSimpleEmailServiceClientBuilder.standard()
//                 .withCredentials(provider)
//                 .build();
//	      
	      
//	      AmazonSimpleEmailService client = 
//	          AmazonSimpleEmailServiceClientBuilder.standard()
//	            .withRegion(Regions.CA_CENTRAL_1).build();
	      
	      String htmlBodyWithToken = PASSWORD_RESET_HTMLBODY.replace("$tokenValue", token);
	             htmlBodyWithToken = htmlBodyWithToken.replace("$firstName", firstName);
	        
	      String textBodyWithToken = PASSWORD_RESET_TEXTBODY.replace("$tokenValue", token);
	             textBodyWithToken = textBodyWithToken.replace("$firstName", firstName);
	      
	      
	      SendEmailRequest request = new SendEmailRequest()
	          .withDestination(
	              new Destination().withToAddresses( email ) )
	          .withMessage(new Message()
	              .withBody(new Body()
	                  .withHtml(new Content()
	                      .withCharset("UTF-8").withData(htmlBodyWithToken))
	                  .withText(new Content()
	                      .withCharset("UTF-8").withData(textBodyWithToken)))
	              .withSubject(new Content()
	                  .withCharset("UTF-8").withData(PASSWORD_RESET_SUBJECT)))
	          .withSource(FROM);

	      SendEmailResult result = client.sendEmail(request); 
	      if(result != null && (result.getMessageId()!=null && !result.getMessageId().isEmpty()))
	      {
	          returnValue = true;
	      }
	      
	      return returnValue;
	  }

}
