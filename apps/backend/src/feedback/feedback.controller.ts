import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthUser } from '../auth/decorators/auth-user.decorator';
import { TReqUser } from '@shared/types';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

class SubmitFeedbackDto {
  @IsInt() @Min(1) @Max(5) @Type(() => Number) rating!: number;
  @IsOptional() @IsString() comment?: string;
}

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('entry/:entryId')
  @UseGuards(JwtAuthGuard)
  submit(
    @Param('entryId') entryId: string,
    @AuthUser() user: TReqUser,
    @Body() body: SubmitFeedbackDto,
  ) {
    return this.feedbackService.submitFeedback(entryId, user.userId, body);
  }

  @Get('business/:businessId')
  getForBusiness(
    @Param('businessId') businessId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedbackService.getBusinessFeedback(
      businessId,
      Number(page ?? 1),
      Number(limit ?? 20),
    );
  }
}
